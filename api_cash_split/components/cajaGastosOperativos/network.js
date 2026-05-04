import controller from "./controller";
import express from "express";
import response from "../../network/response";

const router = express.Router();

router.post("/gastos", [], addGastos);
router.get("/gastos", [], listGastos);
router.put("/gastos", [], editCajaGastos);
router.delete("/gastos", [], removeCajaGastos);

function addGastos(req, resp, next) {
  controller
    .addCajaGastos(req.body)
    .then((data) => response.success(req, resp, data, 201))
    .catch(next);
}

function listGastos(req, resp, next) {
  controller
    .getCajaGastos()
    .then((data) => response.success(req, resp, data, 200))
    .catch(next);
}

function editCajaGastos(req, resp, next) {
  controller
    .editCajaGastos(req.body)
    .then((data) => response.success(req, resp, data, 200))
    .catch(next);
}

function removeCajaGastos(req, resp, next) {
  controller
    .removeCajaGastos(req.params.id)
    .then((data) => response.success(req, resp, data, 200))
    .catch(next);
}

export default router;
