import express from 'express';
import cHome from '../controllers/cHome.js';

const rHome = express();

rHome.get("/", cHome.cHome);

export default rHome;
