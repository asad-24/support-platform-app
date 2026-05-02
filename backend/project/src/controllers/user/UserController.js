const AuthStore = require('@src/services/AuthStore');
const ProfileStore = require('@src/services/VolunteerProfileStore');

function permissionsFor(role) {
  if (role === 'volunteer') return ['sites:create', 'sites:update:assigned'];
  if (role === 'helper') return ['sites:read', 'support:offer'];
  return ['admin:*'];
}

async function flutterUser(user) {
  const source = await AuthStore.getStoredUserById(user.id) || user;
  const profile = source.role === 'volunteer'
    ? await ProfileStore.getByUserId(source.id)
    : null;
  const profileData = source.role === 'volunteer'
    ? ProfileStore.serializeForFlutter(profile)
    : {
        phone: null,
        state: null,
        lga: null,
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

  return {
    id: String(source.id),
    name: source.name,
    email: source.email,
    role: source.role === 'admin' ? 'admin' : 'fieldWorker',
    username: source.username || null,
    ...profileData,
    permissions: permissionsFor(source.role),
  };
}

exports.list = async (req, res) => {
  res.json({ users: ["Alice", "Bob"] });
};

exports.create = async (req, res) => {
  res.status(201).json({ message: "User created" });
};

exports.get = async (req, res) => {
  res.json({ id: req.params.id, name: "Alice" });
};

exports.update = async (req, res) => {
  res.json({ id: req.params.id, updated: true });
};

exports.delete = async (req, res) => {
  res.status(204).send();
};

exports.me = async (req, res) => {
  res.json(await flutterUser(req.auth.user));
};

exports.update_volunteer_profile = async (req, res) => {
  if (!req.auth || !req.auth.user || req.auth.user.role !== 'volunteer') {
    return res.status(403).json({
      error: {
        code: 'VOLUNTEER_ACCESS_REQUIRED',
        message: 'Volunteer access is required.',
      },
    });
  }

  const profileBody = { ...req.body };
  if (!profileBody.fullName && !profileBody.full_name) {
    profileBody.fullName = req.auth.user.name;
  }
  await ProfileStore.upsertForUser(req.auth.user.id, profileBody);
  res.json(await flutterUser(req.auth.user));
};
