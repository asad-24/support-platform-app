'use strict';

const debug = require('@core/util/functions/debug');
const { Model, DataTypes, sequelize } = require('@core/util/classes/Model');

class SchoolWelfareAssessment extends Model {
  static init() {
    return super.init(
      {
        schoolId: { type: DataTypes.INTEGER, allowNull: false, unique: true, field: 'school_id' },
        hasCleanWater: { type: DataTypes.BOOLEAN, allowNull: true, field: 'has_clean_water' },
        hasSanitation: { type: DataTypes.BOOLEAN, allowNull: true, field: 'has_sanitation' },
        hasHealthcare: { type: DataTypes.BOOLEAN, allowNull: true, field: 'has_healthcare' },
        hasNutritiousFood: { type: DataTypes.BOOLEAN, allowNull: true, field: 'has_nutritious_food' },
        hasEducationalMaterials: { type: DataTypes.BOOLEAN, allowNull: true, field: 'has_educational_materials' },
        hasRecreationalFacilities: { type: DataTypes.BOOLEAN, allowNull: true, field: 'has_recreational_facilities' },
        hasClothingShelter: { type: DataTypes.BOOLEAN, allowNull: true, field: 'has_clothing_shelter' },
        hasSleepingArea: { type: DataTypes.BOOLEAN, allowNull: true, field: 'has_sleeping_area' },
        hasElectricity: { type: DataTypes.BOOLEAN, allowNull: true, field: 'has_electricity' },
        hasInternet: { type: DataTypes.BOOLEAN, allowNull: true, field: 'has_internet' },
        hasTransportation: { type: DataTypes.BOOLEAN, allowNull: true, field: 'has_transportation' },
        hasFinancialResources: { type: DataTypes.BOOLEAN, allowNull: true, field: 'has_financial_resources' },
        safetyPhysicalAbuse: { type: DataTypes.BOOLEAN, allowNull: true, field: 'safety_physical_abuse' },
        safetyChildLabor: { type: DataTypes.BOOLEAN, allowNull: true, field: 'safety_child_labor' },
        safetySexualAbuse: { type: DataTypes.BOOLEAN, allowNull: true, field: 'safety_sexual_abuse' },
        safetyTrafficking: { type: DataTypes.BOOLEAN, allowNull: true, field: 'safety_trafficking' },
        additionalNotes: { type: DataTypes.TEXT, allowNull: true, field: 'additional_notes' },
      },
      { sequelize, tableName: 'school_welfare_assessments', modelName: 'SchoolWelfareAssessment' }
    );
  }
}

SchoolWelfareAssessment.init();
debug('model: defined SchoolWelfareAssessment');

module.exports = SchoolWelfareAssessment;
