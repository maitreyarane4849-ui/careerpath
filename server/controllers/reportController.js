const CareerReport = require('../models/CareerReport');
const Roadmap = require('../models/Roadmap');
const { getRecommendations } = require('../services/resourceService');
const { buildReportPdf } = require('../services/pdfService');
const { sendReportEmail } = require('../services/emailService');

async function makePdf(req) {
  const report = await CareerReport.findOne({ _id: req.params.id, user: req.user._id }).lean();
  if (!report) return null;

  const roadmap = await Roadmap.findOne({ report: report._id, user: req.user._id })
    .sort('-createdAt')
    .lean();
  const recommendations = await getRecommendations(report);
  const pdf = await buildReportPdf({ user: req.user, report, roadmap, recommendations });

  const slug = report.primary.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  const date = new Date(report.createdAt).toISOString().slice(0, 10);
  return { pdf, filename: `careerpath-${slug}-${date}.pdf`, report };
}

exports.downloadPdf = async (req, res, next) => {
  try {
    const result = await makePdf(req);
    if (!result) return res.status(404).json({ message: 'Report not found' });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${result.filename}"`,
    });
    res.send(result.pdf);
  } catch (err) {
    next(err);
  }
};

exports.emailPdf = async (req, res, next) => {
  try {
    const to = String(req.body.email || '').trim();
    if (!/^\S+@\S+\.\S+$/.test(to)) {
      return res.status(400).json({ message: 'Enter a valid email address' });
    }

    const result = await makePdf(req);
    if (!result) return res.status(404).json({ message: 'Report not found' });

    try {
      await sendReportEmail({ to, name: req.user.name, filename: result.filename, pdf: result.pdf });
    } catch (err) {
      return res.status(502).json({ message: `Could not send email: ${err.message}` });
    }
    res.json({ message: `Report sent to ${to}` });
  } catch (err) {
    next(err);
  }
};