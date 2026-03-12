import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  Link,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

/* ── Font Registration ── */
Font.register({
  family: 'Lato',
  src: 'https://fonts.gstatic.com/s/lato/v16/S6uyw4BMUTPHjx4wWw.ttf',
});
Font.register({
  family: 'Lato Bold',
  fontWeight: 'bold',
  src: 'https://fonts.gstatic.com/s/lato/v16/S6u9w4BMUTPHh6UVSwiPHA.ttf',
});
Font.register({
  family: 'Lato Light',
  fontWeight: 'light',
  src: 'https://fonts.gstatic.com/s/lato/v16/S6u9w4BMUTPHh50XSwiPHA.ttf',
});
Font.register({
  family: 'Lato Italic',
  fontStyle: 'italic',
  src: 'https://fonts.gstatic.com/s/lato/v16/S6u8w4BMUTPHjxsAXC-v.ttf',
});

/* ── Colors ── */
const C = {
  primary: '#18181b',   // zinc-900
  accent: '#e11d48',    // rose-600
  dark: '#27272a',      // zinc-800
  medium: '#52525b',    // zinc-600
  light: '#a1a1aa',     // zinc-400
  bg: '#fafafa',        // zinc-50
  white: '#ffffff',
};

/* ── Styles ── */
const s = StyleSheet.create({
  page: {
    fontFamily: 'Lato',
    fontSize: 9,
    lineHeight: 1.4,
    color: C.dark,
    padding: 42,
  },
  /* Header */
  header: { marginBottom: 16 },
  name: {
    fontFamily: 'Lato Bold',
    fontSize: 22,
    color: C.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  title: {
    fontFamily: 'Lato Bold',
    fontSize: 12,
    color: C.accent,
    marginBottom: 6,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    fontSize: 8.5,
    color: C.medium,
  },
  contactItem: { marginRight: 12 },
  contactLink: { color: C.accent, textDecoration: 'none' },
  divider: {
    borderBottom: `1px solid ${C.light}`,
    marginTop: 8,
    marginBottom: 4,
  },
  /* Two-column layout */
  columns: { flexDirection: 'row', flex: 1 },
  leftCol: {
    width: 170,
    paddingRight: 14,
    paddingTop: 10,
    borderRight: `1px solid ${C.light}`,
  },
  rightCol: {
    flex: 1,
    paddingLeft: 14,
    paddingTop: 10,
  },
  /* Section */
  sectionTitle: {
    fontFamily: 'Lato Bold',
    fontSize: 10,
    color: C.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottom: `0.5px solid ${C.light}`,
  },
  sectionBlock: { marginBottom: 12 },
  /* Skills */
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  chip: {
    backgroundColor: '#fce7f3', // rose-100
    color: C.accent,
    fontSize: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  /* Contact in left col */
  contactLabel: {
    fontFamily: 'Lato Bold',
    fontSize: 8,
    color: C.medium,
    marginBottom: 1,
    textTransform: 'uppercase',
  },
  contactValue: { fontSize: 8.5, marginBottom: 6, color: C.dark },
  /* Experience / Education */
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  entryTitle: { fontFamily: 'Lato Bold', fontSize: 10, color: C.primary },
  entrySubtitle: { fontFamily: 'Lato Italic', fontSize: 9, color: C.medium, marginBottom: 2 },
  entryDate: { fontSize: 8, color: C.medium },
  bulletRow: { flexDirection: 'row', marginBottom: 2, paddingLeft: 4 },
  bullet: { width: 10, color: C.accent, fontSize: 9 },
  bulletText: { flex: 1, fontSize: 9, lineHeight: 1.4 },
  /* Summary */
  summary: {
    fontSize: 9,
    lineHeight: 1.5,
    color: C.medium,
    marginBottom: 4,
  },
  /* Languages */
  langRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  langName: { fontSize: 9, color: C.dark },
  langLevel: { fontSize: 8, color: C.medium },
});

/* ── Types ── */
export interface ResumeData {
  fullName: string;
  title?: string;
  summary?: string;
  phone?: string;
  email?: string;
  location?: string;
  linkedIn?: string;
  portfolio?: string;
  skills?: string[];
  experience?: {
    company: string;
    position: string;
    location?: string;
    duration?: string;
    achievements?: string[];
  }[];
  education?: {
    institution: string;
    program: string;
    location?: string;
    duration?: string;
  }[];
  certifications?: string[];
  languages?: string[];
}

export interface TailorOverrides {
  tailoredSummary?: string;
  highlightedSkills?: string[];
  suggestedBulletPoints?: string[];
  keywordsToInclude?: string[];
}

interface Props {
  data: ResumeData;
  tailor?: TailorOverrides;
  jobTitle?: string;
  company?: string;
}

/* ── Components ── */

const Header: React.FC<{ data: ResumeData }> = ({ data }) => (
  <View style={s.header}>
    <Text style={s.name}>{data.fullName}</Text>
    {data.title && <Text style={s.title}>{data.title}</Text>}
    <View style={s.contactRow}>
      {data.email && <Text style={s.contactItem}>{data.email}</Text>}
      {data.phone && <Text style={s.contactItem}>{data.phone}</Text>}
      {data.location && <Text style={s.contactItem}>{data.location}</Text>}
      {data.linkedIn && (
        <Link src={data.linkedIn} style={s.contactLink}>
          LinkedIn
        </Link>
      )}
      {data.portfolio && (
        <Link src={data.portfolio} style={s.contactLink}>
          Portfolio
        </Link>
      )}
    </View>
    <View style={s.divider} />
  </View>
);

const SummarySection: React.FC<{ text: string }> = ({ text }) => (
  <View style={s.sectionBlock}>
    <Text style={s.sectionTitle}>Professional Summary</Text>
    <Text style={s.summary}>{text}</Text>
  </View>
);

const SkillsSection: React.FC<{ skills: string[]; highlighted?: string[] }> = ({
  skills,
  highlighted,
}) => {
  const hl = new Set((highlighted ?? []).map((s) => s.toLowerCase()));
  return (
    <View style={s.sectionBlock}>
      <Text style={s.sectionTitle}>Skills</Text>
      <View style={s.chipRow}>
        {skills.map((sk, i) => (
          <Text
            key={i}
            style={[
              s.chip,
              hl.has(sk.toLowerCase())
                ? { backgroundColor: '#fecdd3', fontFamily: 'Lato Bold' }
                : {},
            ]}
          >
            {sk}
          </Text>
        ))}
      </View>
    </View>
  );
};

const ContactSection: React.FC<{ data: ResumeData }> = ({ data }) => {
  const items: { label: string; value: string; link?: string }[] = [];
  if (data.email) items.push({ label: 'Email', value: data.email, link: `mailto:${data.email}` });
  if (data.phone) items.push({ label: 'Phone', value: data.phone });
  if (data.location) items.push({ label: 'Location', value: data.location });
  if (data.linkedIn) items.push({ label: 'LinkedIn', value: 'Profile', link: data.linkedIn });
  if (data.portfolio) items.push({ label: 'Portfolio', value: 'Website', link: data.portfolio });
  if (items.length === 0) return null;
  return (
    <View style={s.sectionBlock}>
      <Text style={s.sectionTitle}>Contact</Text>
      {items.map((it, i) => (
        <View key={i}>
          <Text style={s.contactLabel}>{it.label}</Text>
          {it.link ? (
            <Link src={it.link} style={[s.contactValue, s.contactLink]}>
              {it.value}
            </Link>
          ) : (
            <Text style={s.contactValue}>{it.value}</Text>
          )}
        </View>
      ))}
    </View>
  );
};

const LanguagesSection: React.FC<{ languages: string[] }> = ({ languages }) => (
  <View style={s.sectionBlock}>
    <Text style={s.sectionTitle}>Languages</Text>
    {languages.map((l, i) => (
      <View key={i} style={s.langRow}>
        <Text style={s.langName}>{l}</Text>
      </View>
    ))}
  </View>
);

const CertificationsSection: React.FC<{ certs: string[] }> = ({ certs }) => (
  <View style={s.sectionBlock}>
    <Text style={s.sectionTitle}>Certifications</Text>
    {certs.map((c, i) => (
      <View key={i} style={s.bulletRow}>
        <Text style={s.bullet}>{'\u2022'}</Text>
        <Text style={s.bulletText}>{c}</Text>
      </View>
    ))}
  </View>
);

const ExperienceSection: React.FC<{
  experience: NonNullable<ResumeData['experience']>;
  extraBullets?: string[];
}> = ({ experience, extraBullets }) => (
  <View style={s.sectionBlock}>
    <Text style={s.sectionTitle}>Professional Experience</Text>
    {experience.map((exp, i) => (
      <View key={i} style={{ marginBottom: 8 }}>
        <View style={s.entryHeader}>
          <Text style={s.entryTitle}>
            {exp.position}
          </Text>
          {exp.duration && <Text style={s.entryDate}>{exp.duration}</Text>}
        </View>
        <Text style={s.entrySubtitle}>
          {exp.company}
          {exp.location ? ` — ${exp.location}` : ''}
        </Text>
        {exp.achievements?.map((a, j) => (
          <View key={j} style={s.bulletRow}>
            <Text style={s.bullet}>{'\u2022'}</Text>
            <Text style={s.bulletText}>{a}</Text>
          </View>
        ))}
      </View>
    ))}
    {extraBullets && extraBullets.length > 0 && (
      <View style={{ marginTop: 4 }}>
        <Text style={{ fontFamily: 'Lato Bold', fontSize: 9, color: C.accent, marginBottom: 3 }}>
          Additional Highlights
        </Text>
        {extraBullets.map((b, i) => (
          <View key={i} style={s.bulletRow}>
            <Text style={s.bullet}>{'\u2022'}</Text>
            <Text style={s.bulletText}>{b}</Text>
          </View>
        ))}
      </View>
    )}
  </View>
);

const EducationSection: React.FC<{ education: NonNullable<ResumeData['education']> }> = ({
  education,
}) => (
  <View style={s.sectionBlock}>
    <Text style={s.sectionTitle}>Education</Text>
    {education.map((ed, i) => (
      <View key={i} style={{ marginBottom: 6 }}>
        <View style={s.entryHeader}>
          <Text style={s.entryTitle}>{ed.program}</Text>
          {ed.duration && <Text style={s.entryDate}>{ed.duration}</Text>}
        </View>
        <Text style={s.entrySubtitle}>
          {ed.institution}
          {ed.location ? ` — ${ed.location}` : ''}
        </Text>
      </View>
    ))}
  </View>
);

const KeywordsSection: React.FC<{ keywords: string[] }> = ({ keywords }) => (
  <View style={s.sectionBlock}>
    <Text style={s.sectionTitle}>Key Competencies</Text>
    <View style={s.chipRow}>
      {keywords.map((kw, i) => (
        <Text
          key={i}
          style={[s.chip, { backgroundColor: '#dbeafe', color: '#2563eb' }]}
        >
          {kw}
        </Text>
      ))}
    </View>
  </View>
);

/* ── Main Document ── */

export const ResumePDFDocument: React.FC<Props> = ({ data, tailor, jobTitle, company }) => {
  const summaryText = tailor?.tailoredSummary || data.summary || '';
  const allSkills = data.skills ?? [];
  const hasSkills = allSkills.length > 0;
  const hasExperience = (data.experience?.length ?? 0) > 0;
  const hasEducation = (data.education?.length ?? 0) > 0;
  const hasCerts = (data.certifications?.length ?? 0) > 0;
  const hasLanguages = (data.languages?.length ?? 0) > 0;
  const hasKeywords = (tailor?.keywordsToInclude?.length ?? 0) > 0;

  const docTitle = jobTitle && company
    ? `${data.fullName} - Resume for ${jobTitle} at ${company}`
    : `${data.fullName} - Resume`;

  return (
    <Document title={docTitle} author={data.fullName}>
      <Page size="A4" style={s.page}>
        <Header data={data} />

        {/* Summary below header (full width) */}
        {summaryText && <SummarySection text={summaryText} />}

        {/* Two-column layout */}
        <View style={s.columns}>
          {/* Left column: Contact, Skills, Keywords, Languages, Certs */}
          <View style={s.leftCol}>
            <ContactSection data={data} />
            {hasSkills && (
              <SkillsSection skills={allSkills} highlighted={tailor?.highlightedSkills} />
            )}
            {hasKeywords && <KeywordsSection keywords={tailor!.keywordsToInclude!} />}
            {hasLanguages && <LanguagesSection languages={data.languages!} />}
            {hasCerts && <CertificationsSection certs={data.certifications!} />}
          </View>

          {/* Right column: Experience, Education */}
          <View style={s.rightCol}>
            {hasExperience && (
              <ExperienceSection
                experience={data.experience!}
                extraBullets={tailor?.suggestedBulletPoints}
              />
            )}
            {hasEducation && <EducationSection education={data.education!} />}
          </View>
        </View>
      </Page>
    </Document>
  );
};
