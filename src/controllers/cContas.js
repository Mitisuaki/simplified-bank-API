import { contas, saques, depositos, transferencias } from "../database/database.js";
const accAExists = { message: "Already exists an acc with e-mail or cpf informed" };
const invalidAccNumber = { message: "Please enter a valid acc number " };
const accDExists = { message: "Please verify the acc number, because the one informed doesn't exist" };
const noPW = { message: "Please enter a password" };
const IncorrectPW = { message: "Incorrect password, please check and try again " };
const cantCloseAcc = { message: "Please withdraw all money from the acc before try to close it " }
let lastAccNumber = "0000000-0"

const allAccs = async (req, res) => {
    try {
        res.status(200).json(contas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const createAcc = async (req, res) => {
    let showUser = "";
    let showStatus = 204;

    try {

        const { nome, cpf, data_nascimento,
            telefone, email, senha } = req.body;

        const checkInfos = contas.find(u => u.usuario.cpf === req.body.cpf || u.usuario.email === req.body.email);

        if (!checkInfos) {

            let newAccNumber = Number(lastAccNumber.replace("-", "")) + 1;
            newAccNumber = newAccNumber.toString().padStart(8, "00000000");
            newAccNumber = newAccNumber.slice(0, -1) + "-" + newAccNumber.slice(-1);

            const user = {
                numero_conta: newAccNumber,
                saldo: 0,
                usuario: {
                    nome,
                    cpf,
                    data_nascimento,
                    telefone,
                    email,
                    senha
                }
            };

            lastAccNumber = newAccNumber;
            contas.push(user);

        } else {
            showStatus = 400
            showUser = accAExists;
        }

    } catch (error) {
        showStatus = 500;
        showUser = { message: error.message };

    } finally {
        res.status(showStatus).json(showUser);
    };
};
const updateAcc = async (req, res) => {
    let showUser = "";
    let showStatus = 204;

    try {
        const { cpf, email } = req.body;
        const numero_conta = req.params.numeroConta;
        const indexUser = contas.findIndex(findUser, numero_conta);
        const checkInfos = contas.filter(u => u.usuario.cpf === cpf || u.usuario.email === email);
        const accNumberIsValid = await checkAccNumberEntry(numero_conta);

        if (indexUser !== -1) {

            if (checkInfos.length === 0) {
                contas[indexUser].usuario = req.body;

            } else {
                const sameUser = checkInfos.every(findUser, numero_conta);

                if (sameUser) {
                    contas[indexUser].usuario = req.body;

                } else {
                    showStatus = 400;
                    showUser = accAExists;
                };
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
const deleteAcc = async (req, res) => {
    let showUser = "";
    let showStatus = 204;

    try {
        const numero_conta = req.params.numeroConta;
        const indexUser = contas.findIndex(findUser, numero_conta);
        const accNumberIsValid = await checkAccNumberEntry(numero_conta);


        if (indexUser !== -1) {
            const checkBalance = contas[indexUser].saldo === 0;
            if (!checkBalance) {
                showStatus = 400;
                showUser = cantCloseAcc;

            } else {
                contas.splice(indexUser, 1);
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

const checkBalance = async (req, res) => {
    let showUser = "";
    let showStatus = 204;

    try {
        const { numero_conta, senha } = req.query;
        const indexUser = contas.findIndex(findUser, numero_conta);
        const accNumberIsValid = await checkAccNumberEntry(numero_conta);

        if (indexUser !== -1) {
            const pwIsValid = await validateUserPW(senha, indexUser, contas);

            if (pwIsValid !== true) {
                showStatus = 401;
                showUser = pwIsValid;

            } else {
                showStatus = 200;
                showUser = { saldo: contas[indexUser].saldo };
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
const statementBalance = async (req, res) => {
    let showUser = "";
    let showStatus = 204;

    try {
        const { numero_conta, senha } = req.query;
        const indexUser = contas.findIndex(findUser, numero_conta);
        const accNumberIsValid = await checkAccNumberEntry(numero_conta);

        if (indexUser !== -1) {
            const pwIsValid = await validateUserPW(senha, indexUser, contas);

            if (pwIsValid !== true) {
                showStatus = 401;
                showUser = pwIsValid;

            } else {
                showStatus = 200;
                showUser = {
                    depositos: depositos.filter(findUser, numero_conta),
                    saques: saques.filter(findUser, numero_conta),
                    transferenciasEnviadas: transferencias.enviadas.filter(findUser, numero_conta),
                    transferenciasRecebidas: transferencias.recebidas.filter(findUser, numero_conta)
                };
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

export async function validateUserPW(senha, indexUser, contas) {
    if (senha === undefined || senha === "") {

        return noPW;
    } else if (senha !== contas[indexUser].usuario.senha) {

        return IncorrectPW;
    } else {

        return true;
    };
};

export async function checkAccNumberEntry(numero_conta) {
    if (isNaN(Number(numero_conta)) || numero_conta === "") {
        return {
            showStatus: 400,
            showUser: invalidAccNumber
        };

    } else {
        return {
            showStatus: 404,
            showUser: accDExists
        };
    };
};

export function findUser(user) {
    return Number(user.numero_conta.replace("-", "")) === Number(this);
};

export default {
    allAccs,
    createAcc,
    updateAcc,
    deleteAcc,
    checkBalance,
    statementBalance,
};

export {
    accDExists,
    noPW,
    IncorrectPW
};