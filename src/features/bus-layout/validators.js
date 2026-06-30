import Joi from 'joi';
const layoutElementSchema = Joi.object({
    type: Joi.string()
        .valid('SEAT', 'DRIVER', 'EXIT_FRONT', 'EXIT_REAR', 'EXIT_FIRE', 'WASHROOM', 'ENGINE', 'ROOF_EXIT')
        .required(),
    deck: Joi.string().valid('LOWER', 'UPPER').optional(),
    row: Joi.number().integer().required(),
    col: Joi.number().integer().min(0).max(12).required(),
    label: Joi.string().trim().max(50).allow(null, '').optional(),
    seatNumber: Joi.string().trim().max(10).allow(null, '').optional(),
});
const geometryFields = {
    seatsLeft: Joi.number().integer().min(1).max(5).required(),
    seatsRight: Joi.number().integer().min(1).max(5).required(),
};
const busMetaFields = {
    hasAc: Joi.boolean().optional(),
    bodyType: Joi.string().valid('SEATER', 'SLEEPER', 'SEMI_SLEEPER').optional(),
    hasUpperDeck: Joi.boolean().optional(),
    lowerDeckCapacity: Joi.number().integer().min(0).max(100).optional(),
    upperDeckCapacity: Joi.number().integer().min(0).max(100).optional(),
};
export const saveBusLayoutSchema = {
    body: Joi.object({
        layoutType: Joi.string()
            .valid('SEATER_2_2', 'SEATER_2_1', 'SLEEPER_1_1')
            .required(),
        ...geometryFields,
        elements: Joi.array().items(layoutElementSchema).min(1).required(),
        ...busMetaFields,
    }),
};
export const applyBusLayoutTemplateSchema = {
    body: Joi.object({
        layoutType: Joi.string()
            .valid('SEATER_2_2', 'SEATER_2_1', 'SLEEPER_1_1')
            .required(),
        seatCapacity: Joi.number().integer().min(1).max(100).optional(),
        seatsLeft: Joi.number().integer().min(1).max(5).optional(),
        seatsRight: Joi.number().integer().min(1).max(5).optional(),
        ...busMetaFields,
    }),
};
export const regenerateBusLayoutSchema = {
    body: Joi.object({
        ...geometryFields,
        seatCapacity: Joi.number().integer().min(1).max(100).required(),
        capElements: Joi.array().items(layoutElementSchema).required(),
        ...busMetaFields,
    }),
};
//# sourceMappingURL=validators.js.map