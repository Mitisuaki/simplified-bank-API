import cpfValidator from "node-cpf";
import emailValidator from "email-validator";
import { banco, contas } from "../database/database.js";
import { parse as checkPhoneNumber } from 'telefone';
// const { banco } = await fs.readJSON('./src/database/database.json');

const checkBankPW = async (req, res, next) => {
    let showUser = "Incorrect Password";
    let showStatus = 401;
    let ok = false;
    try {
        const { senha_banco } = req.query;
        if (senha_banco !== undefined && senha_banco !== "") {
            if (senha_banco === banco.senha) {
                ok = true;
            }
        } else {
            showUser = "Please enter a password";
        };
    } catch (error) {
        showStatus = 500;
        showUser = { message: error.message };
    } finally {
        if (ok) {
            next();
        } else {
            res.status(showStatus).json(showUser);
        };
    };
};

const checkInputsToCreateOrEditAcc = async (req, res, next) => {
    let showUser = {};
    let showStatus = 400;

    try {
        const { nome, cpf, data_nascimento,
            telefone, email, senha } = req.body;

        if (!nome) {
            showUser.nome = "Please check 'nome' input";
        };
        if (!cpf || isNaN(Number(cpf)) || !cpfValidator.validate(cpf)) {
            showUser.cpf = "Please check 'cpf' input";
        };
        if (!data_nascimento || isNaN(new Date(data_nascimento))) {
            showUser.data_nascimento = "Please check 'data_nascimento' input";
        };
        if (!telefone || checkPhoneNumber(telefone) === null) {
            showUser.telefone = "Please check 'telefone' input";
        };
        if (!email || !emailValidator.validate(email)) {
            showUser.email = "Please check 'email' input";
        };
        if (!senha) {
            showUser.senha = "Please check 'senha' input";
        };

    } catch (error) {
        showStatus = 500;
        showUser = { message: error.message };
    } finally {
        if (Object.keys(showUser).length === 0) {
            next();
        } else {
            res.status(showStatus).json(showUser);
        };
    };
};

const checkValue = async (req, res, next) => {

    let showUser = { message: "Please enter a valid 'valor' to proceed with your transaction" };
    let showStatus = 404;
    const { valor } = req.body

    try {

    } catch (error) {
        showStatus = 500;
        showUser = { message: error.message };
    } finally {
        if (Number(valor) > 0 && !isNaN(Number(valor))) {
            next();
        } else {
            res.status(showStatus).json(showUser);
        };
    };
};

export default {
    checkBankPW,
    checkInputsToCreateOrEditAcc,
    checkValue
};