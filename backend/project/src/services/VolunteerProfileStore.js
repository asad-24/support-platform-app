'use strict';

const VolunteerProfile = require('@src/models/VolunteerProfile');

const REQUIRED_FIELDS = ['fullName', 'phone', 'state', 'lga', 'address'];

function readString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function pick(body, ...keys) {
  if (!body || typeof body !== 'object') return undefined;
  for (const key of keys) {
    if (body[key] !== undefined) return body[key];
  }
  return undefined;
}

function normalizePayload(body = {}) {
  const payload = {};
  const map = [
    ['fullName', 'full_name'],
    ['phone', 'phone'],
    ['profilePhotoUrl', 'profile_photo_url', 'profileImagePath'],
    ['state', 'state'],
    ['lga', 'lga'],
    ['ward', 'ward'],
    ['community', 'community'],
    ['address', 'address'],
    ['bio', 'bio'],
    ['dateOfBirth', 'date_of_birth'],
    ['gender', 'gender'],
    ['educationLevel', 'education_level'],
    ['occupation', 'occupation'],
    ['skills', 'skills'],
    ['volunteerExperience', 'volunteer_experience'],
    ['availability', 'availability'],
    ['volunteeringMode', 'volunteering_mode'],
    ['motivation', 'motivation'],
    ['emergencyContactName', 'emergency_contact_name'],
    ['emergencyContactPhone', 'emergency_contact_phone'],
  ];

  for (const [camel, ...keys] of map) {
    const value = pick(body, camel, ...keys);
    if (value !== undefined) payload[camel] = typeof value === 'string' ? value.trim() : value;
  }

  return payload;
}

function normalizeEditablePayload(body = {}) {
  const payload = {};
  const map = [
    ['fullName', 'full_name', 'name'],
    ['phone', 'phone'],
    ['state', 'state'],
    ['lga', 'lga'],
    ['ward', 'ward'],
    ['address', 'address'],
    ['profilePhotoUrl', 'profile_photo_url', 'profileImagePath'],
  ];

  for (const [camel, ...keys] of map) {
    const value = pick(body, camel, ...keys);
    if (value !== undefined) payload[camel] = typeof value === 'string' ? value.trim() : value;
  }

  return payload;
}

function isCompletePayload(payload = {}) {
  return REQUIRED_FIELDS.every((field) => readString(payload[field]));
}

function isComplete(profile) {
  if (!profile) return false;
  const data = typeof profile.toJSON === 'function' ? profile.toJSON() : profile;
  return Boolean(data.isCompleted) && isCompletePayload(data);
}

function serialize(profile) {
  if (!profile) return null;
  const data = typeof profile.toJSON === 'function' ? profile.toJSON() : profile;
  return {
    id: data.id,
    user_id: data.userId,
    full_name: data.fullName,
    phone: data.phone,
    profile_photo_url: data.profilePhotoUrl,
    state: data.state,
    lga: data.lga,
    ward: data.ward,
    community: data.community,
    address: data.address,
    bio: data.bio,
    date_of_birth: data.dateOfBirth,
    gender: data.gender,
    education_level: data.educationLevel,
    occupation: data.occupation,
    skills: data.skills,
    volunteer_experience: data.volunteerExperience,
    availability: data.availability,
    volunteering_mode: data.volunteeringMode,
    motivation: data.motivation,
    emergency_contact_name: data.emergencyContactName,
    emergency_contact_phone: data.emergencyContactPhone,
    is_completed: Boolean(data.isCompleted),
    completed_at: data.completedAt,
    created_at: data.createdAt,
    updated_at: data.updatedAt,
  };
}

function serializeForFlutter(profile) {
  if (!profile) {
    return {
      phone: null,
      state: null,
      lga: null,
      ward: null,
      address: null,
      dateOfBirth: null,
      gender: null,
      educationLevel: null,
      occupation: null,
      skills: null,
      volunteerExperience: null,
      availability: null,
      volunteeringMode: null,
      motivation: null,
      emergencyContactName: null,
      emergencyContactPhone: null,
      profileImagePath: null,
      profileComplete: true,
    };
  }

  const data = typeof profile.toJSON === 'function' ? profile.toJSON() : profile;
  return {
    phone: data.phone || null,
    state: data.state || null,
    lga: data.lga || null,
    ward: data.ward || null,
    address: data.address || null,
    dateOfBirth: data.dateOfBirth || null,
    gender: data.gender || null,
    educationLevel: data.educationLevel || null,
    occupation: data.occupation || null,
    skills: data.skills || null,
    volunteerExperience: data.volunteerExperience || null,
    availability: data.availability || null,
    volunteeringMode: data.volunteeringMode || null,
    motivation: data.motivation || null,
    emergencyContactName: data.emergencyContactName || null,
    emergencyContactPhone: data.emergencyContactPhone || null,
    profileImagePath: data.profilePhotoUrl || null,
    profileComplete: true,
  };
}

async function getByUserId(userId) {
  return VolunteerProfile.findOne({ where: { userId } });
}

async function getStatus(userId) {
  const profile = await getByUserId(userId);
  return {
    profile: serialize(profile),
    profile_completed: true,
    next_step: 'dashboard',
    actual_profile_completed: isComplete(profile),
  };
}

async function upsertForUser(userId, body = {}) {
  const payload = normalizePayload(body);
  const existing = await getByUserId(userId);
  const combined = { ...(existing ? existing.toJSON() : {}), ...payload };
  const complete = isCompletePayload(combined);
  payload.isCompleted = complete;
  payload.completedAt = complete ? (existing && existing.completedAt ? existing.completedAt : new Date()) : null;

  const profile = existing
    ? await existing.update(payload)
    : await VolunteerProfile.create({ ...payload, userId });

  return profile;
}

async function destroyForUser(userId) {
  return VolunteerProfile.destroy({ where: { userId } });
}

module.exports = {
  getByUserId,
  getStatus,
  isComplete,
  normalizeEditablePayload,
  normalizePayload,
  serialize,
  serializeForFlutter,
  upsertForUser,
  destroyForUser,
};
