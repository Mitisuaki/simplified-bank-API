import express from 'express';
import cContas from '../controllers/cContas.js';
import middlewares from '../middlewares/middlewares.js';

const rContas = express();

rContas.get("/contas", middlewares.checkBankPW, cContas.allAccs);
rContas.get("/contas/saldo", cContas.checkBalance);
rContas.get("/contas/extrato", cContas.statementBalance);
rContas.post("/contas", middlewares.checkInputsToCreateOrEditAcc, cContas.createAcc);
rContas.put("/contas/:numeroConta/usuario", middlewares.checkInputsToCreateOrEditAcc, cContas.updateAcc);
rContas.delete("/contas/:numeroConta", cContas.deleteAcc);

export default rContas;