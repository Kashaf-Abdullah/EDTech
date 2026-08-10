const PlatformSettings = require('../models/PlatformSettings');

const getOrCreate = async () => {
  let settings = await PlatformSettings.findOne();
  if (!settings) settings = await PlatformSettings.create({});
  return settings;
};

exports.getSettings = async (req, res, next) => {
  try {
    const settings = await getOrCreate();
    res.json({ success: true, settings });
  } catch (err) { next(err); }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const settings = await getOrCreate();
    const { adminName, adminDesignation, platformName } = req.body;
    if (adminName)        settings.adminName = adminName;
    if (adminDesignation) settings.adminDesignation = adminDesignation;
    if (platformName)     settings.platformName = platformName;
    if (req.files?.signature?.[0]) settings.adminSignature = req.files.signature[0].path;
    if (req.files?.logo?.[0])      settings.platformLogo   = req.files.logo[0].path;
    await settings.save();
    res.json({ success: true, settings });
  } catch (err) { next(err); }
};
