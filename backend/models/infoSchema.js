const { Schema, model } = require('mongoose');

const infoSchema = new Schema({
    userId: { type: String, required: true },
    patientNumber: { type: Number, required: true, default: -1 },
    issueSummarization: { type: String, required: false, default: "" },
    fullInfo: { type: String, required: false, default: "" },
    doctorApproved: { type: Boolean, required: true, default: false },
    forms: { type: Map, of: String, default: new Map() }
});

module.exports = model('Info', infoSchema);
