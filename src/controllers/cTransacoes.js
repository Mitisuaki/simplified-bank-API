import { contas, saques, depositos, transferencias } from "../database/database.js";
import {
    findUser,
    validateUserPW,
    checkAccNumberEntry
} from "./cContas.js";

const noBalance = { message: "You don't have that balance, please verify and try again" };
const invalidOrigemMsg = { message: "Please enter a valid 'origem' acc number " };
const invalidDestinoMsg = { message: "Please enter a valid 'destino' acc number " };
const transferToSameAcc = { message: "You cannot do a transference to the same acc " };
const origemAccDExists = { message: "Please verify the 'origem' acc number, because it doesn't exists " };
const destinoAccDExists = { message: "Please verify the 'destino' acc number, because it doesn't exists " };
const bothAccDExists = { message: "Please verify the acc numbers, because both accs informed don't exist" };

async function formatAccNumber(numero_conta) {
    let formatedAccNumber = numero_conta.toString().padStart(8, "00000000");
    formatedAccNumber = formatedAccNumber.slice(0, -1) + "-" + formatedAccNumber.slice(-1);

    return formatedAccNumber;
};

const allTransactions = async (req, res) => {
    let showUser = {};
    let showStatus = 0;

    try {
        showUser = {
            saques,
            depositos,
            transferencias
        };
        showStatus = 200;

    } catch (error) {
        showStatus = 500;
        showUser = { message: error.message };
    } finally {
        res.status(showStatus).json(showUser);
    };
};
const deposit = async (req, res) => {
    let showUser = {};
    let showStatus = 204;
    try {
        const { numero_conta, valor } = req.body;
        const indexUser = contas.findIndex(findUser, numero_conta);
        const accNumberIsValid = await checkAccNumberEntry(numero_conta);

        if (indexUser !== -1) {

            contas[indexUser].saldo += valor;

            const deposito = {
                data: new Date(),
                numero_conta: await formatAccNumber(numero_conta),
                valor
            };
            depositos.push(deposito);
        } else {
            showStatus = accNumberIsValid.showStatus;
            showUser = accNumberIsValid.showUser;
        };

    } catch (error) {
        showStatus = 500;
        showUser = { message: error.message };
    } finally {
        res.status(showStatus).json(showUser);
    };
};
const withdraw = async (req, res) => {
    let showUser = {};
    let showStatus = 204;
    try {
        const { numero_conta, valor, senha } = req.body;
        const indexUser = contas.findIndex(findUser, numero_conta);
        const accNumberIsValid = await checkAccNumberEntry(numero_conta);

        if (indexUser !== -1) {
            const pwIsValid = await validateUserPW(senha, indexUser, contas);

            if (pwIsValid !== true) {
                showStatus = 401;
                showUser = pwIsValid;

            } else if (valor > contas[indexUser].saldo) {
                showStatus = 401;
                showUser = noBalance;

            } else {
                contas[indexUser].saldo -= valor;
                const saque = {
                    data: new Date(),
                    numero_conta: await formatAccNumber(numero_conta),
                    valor
                };
                saques.push(saque);
            };

        } else {
            showStatus = accNumberIsValid.showStatus;
            showUser = accNumberIsValid.showUser;
        };

    } catch (error) {
        showStatus = 500;
        showUser = { message: error.message };
    } finally {
        res.status(showStatus).json(showUser);
    };
};

const transfer = async (req, res) => {
    let showUser = [];
    let showStatus = 204;
    try {
        const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;
        const sameAcc = Number(numero_conta_origem) === Number(numero_conta_destino);
        const indexUserOrigem = contas.findIndex(findUser, numero_conta_origem);
        const indexUserDestino = contas.findIndex(findUser, numero_conta_destino);
        const invalidOrigem = isNaN(Number(numero_conta_origem)) || !numero_conta_origem;
        const invalidDestino = isNaN(Number(numero_conta_destino)) || !numero_conta_destino;

        if (indexUserOrigem !== -1 && indexUserDestino !== -1 && !sameAcc) {

            const pwIsValid = await validateUserPW(senha, indexUserOrigem, contas);

            if (pwIsValid !== true) {
                showStatus = 401;
                showUser = pwIsValid;

            } else if (valor > contas[indexUserOrigem].saldo) {
                showStatus = 401;
                showUser = noBalance;

            } else {
                const transferSent = {
                    data: new Date(),
                    numero_conta: await formatAccNumber(numero_conta_origem),
                    to: {
                        nome: contas[indexUserDestino].usuario.nome,
                        numero_conta: await formatAccNumber(numero_conta_destino)
                    },
                    valor
                };
                contas[indexUserOrigem].saldo -= valor;
                transferencias.enviadas.push(transferSent);

                const transferReceived = {
                    data: new Date(),
                    numero_conta: await formatAccNumber(numero_conta_destino),
                    from: {
                        nome: contas[indexUserOrigem].usuario.nome,
                        numero_conta: await formatAccNumber(numero_conta_origem)
                    },
                    valor
                };
                contas[indexUserDestino].saldo += valor;
                transferencias.recebidas.push(transferReceived);
            };

        } else {
            if (invalidOrigem || invalidDestino) {

                if (invalidOrigem) {
                    showStatus = 400;
                    showUser.push(invalidOrigemMsg);

                };
                if (invalidDestino) {
                    showStatus = 400;
                    showUser.push(invalidDestinoMsg);
                };

            } else if (sameAcc) {
                showStatus = 400;
                showUser = transferToSameAcc;

            } else {
                if (indexUserOrigem !== -1 || indexUserDestino !== -1) {
                    if (indexUserOrigem === -1) {
                        showStatus = 400;
                        showUser.push(origemAccDExists);
                    };

                    if (indexUserDestino === -1) {
                        showStatus = 400;
                        showUser.push(destinoAccDExists);
                    };
                }
                else {
                    showStatus = 404;
                    showUser = bothAccDExists;
                };
            };
        };

    } catch (error) {
        showStatus = 500;
        showUser = { message: error.message };
    } finally {
        res.status(showStatus).json(showUser);
    };
};

export default {
    allTransactions,
    deposit,
    withdraw,
    transfer
};