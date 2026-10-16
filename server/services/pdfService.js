const PDFDocument = require('pdfkit');

const heading = (doc, text) => {
  doc.moveDown(0.8).font('Helvetica-Bold').fontSize(14).fillColor('#1e3a8a').text(text);
  doc.moveDown(0.3).font('Helvetica').fontSize(10.5).fillColor('#000000');
};

const line = (doc, text) => doc.font('Helvetica').fontSize(10.5).fillColor('#000000').text(text);

function buildReportPdf({ user, report, roadmap, recommendations }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const p = report.primary;
    const profile = report.profileSnapshot || {};
    const edu = profile.education || {};

    // Title
    doc.font('Helvetica-Bold').fontSize(24).fillColor('#1e3a8a').text('CareerPath');
    doc.font('Helvetica').fontSize(12).fillColor('#444444').text('Career Analysis and Roadmap Report');
    doc.moveDown(0.5);
    line(doc, `Student: ${user.name} (${user.email})`);
    line(doc, `Generated: ${new Date(report.createdAt).toLocaleString()}`);

    // Profile
    heading(doc, 'Student Profile');
    line(doc, `Education: ${[edu.degree, edu.specialization].filter(Boolean).join(' - ') || 'Not provided'}`);
    if (edu.institution) line(doc, `Institution: ${edu.institution}`);
    if (edu.graduationYear) line(doc, `Graduation year: ${edu.graduationYear}`);
    line(doc, `Skills: ${(profile.skills || []).map((s) => `${s.name} (${s.level})`).join(', ') || 'None'}`);
    line(doc, `Interests: ${(profile.interests || []).join(', ') || 'None'}`);
    line(doc, `Career goal: ${profile.careerGoal || 'Not specified'}`);

    // Primary career
    heading(doc, `Recommended Career: ${p.title}`);
    line(doc, `Compatibility score: ${p.score}%  (skills ${p.skillScore}%, interests ${p.interestScore}%)`);
    doc.fontSize(9).fillColor('#666666').text(
      'This score shows how closely your profile matches the career requirements in our database. It is not a prediction of employment or career success.'
    );
    doc.moveDown(0.4);
    line(doc, p.description);
    if (p.matchedSkills.length) line(doc, `Skills you already meet: ${p.matchedSkills.join(', ')}`);

    // Skill gaps
    heading(doc, 'Skill Gap Analysis');
    if (p.skillGaps.length === 0) {
      line(doc, 'No gaps found for this career.');
    } else {
      p.skillGaps.forEach((g) => {
        line(
          doc,
          g.status === 'Missing'
            ? `- ${g.skill}: Missing (needed level: ${g.requiredLevel})`
            : `- ${g.skill}: Improve from ${g.currentLevel} to ${g.requiredLevel}`
        );
      });
    }

    // Alternatives
    if (report.alternatives.length) {
      heading(doc, 'Alternative Careers');
      report.alternatives.forEach((a) => line(doc, `- ${a.title}: ${a.score}% match`));
    }

    // Roadmap
    if (roadmap) {
      heading(doc, 'Your Personalized Roadmap');
      line(doc, roadmap.summary);
      roadmap.phases.forEach((ph, i) => {
        doc.moveDown(0.6).font('Helvetica-Bold').fontSize(11.5).fillColor('#000000')
          .text(`Phase ${i + 1}: ${ph.title}`);
        if (ph.description) line(doc, ph.description);
        ph.tasks.forEach((t) => line(doc, `   ${t.done ? '[x]' : '[ ]'} ${t.title} (${t.type})`));
      });
    }

    // Resources
    if (recommendations) {
      heading(doc, 'Learning Resources');
      let any = false;
      recommendations.learning.forEach((g) => {
        if (!g.resources.length) return;
        any = true;
        doc.font('Helvetica-Bold').fontSize(10.5).text(g.skill);
        g.resources.forEach((r) => {
          doc.font('Helvetica').fillColor('#1d4ed8').text(`   ${r.title} (${r.provider})`, { link: r.url, underline: true });
          doc.fillColor('#000000');
        });
      });
      if (!any) line(doc, 'No curated resources available for your current gaps yet.');

      if (recommendations.projects.length) {
        heading(doc, 'Suggested Projects');
        recommendations.projects.forEach((r) => line(doc, `- ${r.title}: ${r.description}`));
      }
      if (recommendations.certifications.length) {
        heading(doc, 'Suggested Certifications');
        recommendations.certifications.forEach((r) => {
          doc.font('Helvetica').fillColor('#1d4ed8').text(`- ${r.title} (${r.provider})`, { link: r.url, underline: true });
          doc.fillColor('#000000');
        });
      }
    }

    // Disclaimer
    doc.moveDown(1.5).font('Helvetica-Oblique').fontSize(8.5).fillColor('#666666').text(
      'CareerPath provides decision support only and is not a substitute for professional career counseling. ' +
      'Course, project and certification details can change; please verify them on the provider websites.'
    );

    doc.end();
  });
}

module.exports = { buildReportPdf };