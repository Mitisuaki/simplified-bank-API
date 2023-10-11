import express from 'express';
import cTransacoes from '../controllers/cTransacoes.js';
import middlewares from '../middlewares/middlewares.js';

const rTransacoes = express();

rTransacoes.get("/transacoes", middlewares.checkBankPW, cTransacoes.allTransactions);
rTransacoes.post("/transacoes/depositar", middlewares.checkValue, cTransacoes.deposit);
rTransacoes.post("/transacoes/sacar", middlewares.checkValue, cTransacoes.withdraw);
rTransacoes.post("/transacoes/transferir", middlewares.checkValue, cTransacoes.transfer);

export default rTransacoes;