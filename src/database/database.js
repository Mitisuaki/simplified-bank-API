const banco = {
    nome: 'Cubos Bank',
    numero: '123',
    agencia: '0001',
    senha: 'Cubos123Bank'
};
let contas = [], saques = [], depositos = [], transferencias = { enviadas: [], recebidas: [] };

export {
    banco,
    contas,
    saques,
    depositos,
    transferencias
};