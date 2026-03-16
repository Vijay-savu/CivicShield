const Scheme = require("../../models/Scheme");
const { logEvent } = require("../../utils/logEvent");

const listSchemes = async (req, res, next) => {
  try {
    const query = req.user?.role === "admin" ? {} : { active: true };
    const schemes = await Scheme.find(query).sort({ createdAt: 1, name: 1 });
    return res.status(200).json({ schemes });
  } catch (error) {
    return next(error);
  }
};

const createScheme = async (req, res, next) => {
  try {
    const scheme = await Scheme.create(req.body);

    await logEvent({
      action: "scheme_created",
      user: req.user.email,
      userId: req.user.id,
      status: "success",
      details: `Created scheme ${scheme.name}`,
      ipAddress: req.ip || "unknown",
    });

    return res.status(201).json({ scheme });
  } catch (error) {
    return next(error);
  }
};

const updateScheme = async (req, res, next) => {
  try {
    const scheme = await Scheme.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (!scheme) {
      return res.status(404).json({ message: "Scheme not found." });
    }

    await logEvent({
      action: "scheme_updated",
      user: req.user.email,
      userId: req.user.id,
      status: "success",
      details: `Updated scheme ${scheme.name}`,
      ipAddress: req.ip || "unknown",
    });

    return res.status(200).json({ scheme });
  } catch (error) {
    return next(error);
  }
};

const deleteScheme = async (req, res, next) => {
  try {
    const scheme = await Scheme.findByIdAndDelete(req.params.id);

    if (!scheme) {
      return res.status(404).json({ message: "Scheme not found." });
    }

    await logEvent({
      action: "scheme_deleted",
      user: req.user.email,
      userId: req.user.id,
      status: "warning",
      details: `Deleted scheme ${scheme.name}`,
      ipAddress: req.ip || "unknown",
    });

    return res.status(200).json({ message: "Scheme removed successfully." });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listSchemes,
  createScheme,
  updateScheme,
  deleteScheme,
};
