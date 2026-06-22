import { createCity, deleteCity, getCityById, listCities, updateCity, } from "./service.js";
export async function createCityController(req, res, next) {
    try {
        const city = await createCity(req.body);
        res.status(201).json({ success: true, data: city });
    }
    catch (err) {
        next(err);
    }
}
export async function listCitiesController(req, res, next) {
    try {
        const search = typeof req.query.search === "string" ? req.query.search : undefined;
        const cities = await listCities(search);
        res.json({ success: true, data: cities });
    }
    catch (err) {
        next(err);
    }
}
export async function getCityByIdController(req, res, next) {
    try {
        const id = Number(req.params.id);
        const city = await getCityById(id);
        res.json({ success: true, data: city });
    }
    catch (err) {
        next(err);
    }
}
export async function updateCityController(req, res, next) {
    try {
        const id = Number(req.params.id);
        const city = await updateCity(id, req.body);
        res.json({ success: true, data: city });
    }
    catch (err) {
        next(err);
    }
}
export async function deleteCityController(req, res, next) {
    try {
        const id = Number(req.params.id);
        const result = await deleteCity(id);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=controller.js.map