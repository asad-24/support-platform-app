const AuthStore = require('@src/services/AuthStore');
const ProfileStore = require('@src/services/VolunteerProfileStore');
const FlutterSchoolStore = require('@src/services/FlutterSchoolStore');
const FileStorage = require('@src/services/FileStorage');
const User = require('@src/models/User');

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

  const profileBody = ProfileStore.normalizeEditablePayload(req.body);
  const requestedName = profileBody.fullName;
  if (!profileBody.fullName) profileBody.fullName = req.auth.user.name;

  if (req.file) {
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({
        error: {
          code: 'INVALID_PROFILE_IMAGE',
          message: 'Profile picture must be an image file.',
        },
      });
    }
    const stored = await FileStorage.saveUploadedFile(req.file, {
      folder: `profiles/${req.auth.user.id}`,
      req,
    });
    profileBody.profileImagePath = stored.publicUrl;
  }

  if (requestedName) {
    const user = await User.findByPk(req.auth.user.id);
    if (user) {
      user.name = requestedName;
      await user.save();
      req.auth.user = { ...req.auth.user, name: user.name };
    }
  }

  await ProfileStore.upsertForUser(req.auth.user.id, profileBody);
  res.json(await flutterUser(req.auth.user));
};

exports.submitted_sites = async (req, res) => {
  try {
    res.json(await FlutterSchoolStore.listSubmittedSites(req.params.userId, req.query, req.auth.user));
  } catch (error) {
    if (error.body) return res.status(error.status || 500).json(error.body);
    return res.status(error.status || 500).json({
      error: {
        code: error.status === 404 ? 'NOT_FOUND' : 'REQUEST_FAILED',
        message: error.message || 'Request failed.',
      },
    });
  }
};
