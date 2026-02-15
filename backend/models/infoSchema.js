const { Schema, model } = require('mongoose');

const infoSchema = new Schema({
    userId: { type: Number, required: true },
    patientNumber: { type: Number, required: true, default: -1 },
    issueSummarization: { type: String, required: true, default: "" },
    fullInfo: { type: String, required: true, default: "" },
    doctorApproved: { type: Boolean, required: true, default: false },
    forms: { type: Map, of: String, default: new Map() }
});

module.exports = model('Info', infoSchema);
