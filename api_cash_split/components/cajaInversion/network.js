import controller from "./controller";
import express from "express";
import response from "../../network/response";

const router = express.Router();

router.post("/inversion", addInversion);
router.delete("/inversion/:id", delInversion);
router.put("/inversion", editInversion);
router.get("/inversion", getCajaInversion);

function addInversion(req, resp, next) {
  controller
    .addCajaInversion(req.body)
    .then((data) => response.success(req, resp, data, 201))
    .catch(next);
}

function delInversion(req, resp, next) {
  controller
    .removeCajaInversion(req.params.id)
    .then((data) => response.success(req, resp, data, 200))
    .catch(next);
}

function editInversion(req, resp, next) {
  controller
    .editCajaInversion(req.body)
    .then((data) => response.success(req, resp, data, 200))
    .catch(next);
}

function getCajaInversion(req, resp, next) {
  controller
    .listCajaInversion()
    .then((data) => response.success(req, resp, data, 200))
    .catch(next);
}

export default router;
