const mongoose = require('mongoose');

const ExerciseBlueprintSchema = new mongoose.Schema({
  exercise_id: { type: String, required: true, unique: true },
  name: { type: String, required: true, uppercase: true }, 
  category: { type: String }, // 'Push', 'Pull', 'Squat', 'Lunge', etc.
  
  // THE V2.0 BIOMECHANICS ENGINE
  biomechanics_engine: {
    engine_type: { type: String },
    primary_tracking: {
      joint1: { type: String }, 
      joint2: { type: String }, 
      joint3: { type: String }, 
      down_angle_threshold: { type: Number },
      up_angle_threshold: { type: Number }
    },
    secondary_tracking: {
      joint1: { type: String },
      joint2: { type: String },
      joint3: { type: String },
      safe_min_angle: { type: Number }
    },
    spatial_anchors: {
      y_axis_descent_node: { type: String },
      x_axis_stability_node: { type: String }
    },
    rep_validation: {
      min_time_in_hole_ms: { type: Number },
      cooldown_between_reps_ms: { type: Number }
    }
  },

  // THE V2.0 DYNAMIC VOICE FAULTS (Changed to an Array of Objects)
  fault_triggers: [{
    fault_id: { type: String },
    phase: { type: String },
    math_condition: { type: String },
    tts_audio: { type: String },
    priority: { type: Number }
  }],

  coaching_cues: {
    setup: { type: String },
    execution: { type: String },
    common_fault: { type: String }
  }
});

module.exports = mongoose.model('ExerciseBlueprint', ExerciseBlueprintSchema);