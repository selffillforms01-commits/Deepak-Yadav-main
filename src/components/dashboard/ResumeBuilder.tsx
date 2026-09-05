import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { UserProfile } from '../../types';

interface ResumeBuilderProps {
  user?: UserProfile;
}

type ResumeProfile = UserProfile & {
  profilePhotoUrl?: string;
  photoUrl?: string;
  avatarUrl?: string;
  profileImageUrl?: string;

  careerObjective?: string;
  otherQualification?: string | string[];

  workExperience?: string | string[];
  experience?: string | string[];
  professionalExperience?: string | string[];

  declaration?: string;
};

const toList = (value: unknown): string[] => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  return String(value)
    .split(/\r?\n|;/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="mb-5">
    <div className="flex items-center gap-3 mb-2">
      <h2 className="text-[16px] font-bold tracking-wide text-slate-900">
        {title}
      </h2>
      <div className="h-[2px] flex-1 bg-slate-300" />
    </div>
    {children}
  </section>
);

const Field = ({
  label,
  value,
}: {
  label: string;
  value?: string;
}) =>
  value ? (
    <div className="flex gap-2 text-[13px] leading-5">
      <span className="font-bold min-w-[105px] text-slate-700">
        {label}
      </span>
      <span className="text-slate-900 break-words">{value}</span>
    </div>
  ) : null;

export const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ user }) => {
  const [resumeScale, setResumeScale] = useState(1);
  const resumeContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const updateResumeScale = () => {
      if (window.innerWidth < 768) {
        const a4WidthPx = 793.7;
        const availableWidth = Math.max(window.innerWidth - 20, 280);
        setResumeScale(Math.min(1, availableWidth / a4WidthPx));
      } else {
        setResumeScale(1);
      }
    };

    updateResumeScale();
    window.addEventListener('resize', updateResumeScale);

    return () => {
      window.removeEventListener('resize', updateResumeScale);
    };
  }, []);
  const p = (user || {}) as ResumeProfile;

  const defaultCareerObjective =
    'To obtain a responsible position in a professional organization where I can utilize my knowledge and skills, learn new opportunities, and contribute to the growth and success of the organization.';

  const careerObjective =
    p.careerObjective?.trim() || defaultCareerObjective;

  const name = p.fullName || p.name || '';
  const email = p.email || '';
  const mobile = p.mobileNumber || p.mobile || '';

  const photo =
    p.profilePhotoUrl ||
    p.photoUrl ||
    p.avatarUrl ||
    p.profileImageUrl ||
    '';

  const languages = toList(p.languagesKnown);
  const hobbies = toList(p.hobbies);

  const otherQualifications = toList(p.otherQualification);

  const experience = toList(
    p.workExperience ||
      p.professionalExperience ||
      p.experience
  );

  const education: {
    qualification: string;
    stream: string;
    boardUniversity: string;
    schoolCollege: string;
    passingYear: string;
    percentage?: string;
  }[] = [
    p.tenthBoardName
      ? {
          qualification: '10th',
          stream: '',
          boardUniversity: p.tenthBoardName,
          schoolCollege: p.tenthSchoolName || '',
          passingYear: p.tenthPassingYear || '',
          percentage: p.tenthPercentage || '',
        }
      : null,

    p.twelfthCouncilBoard ||
    p.twelfthSchoolCollegeName ||
    p.twelfthStream
      ? {
          qualification: '+2',
          stream: p.twelfthStream || '',
          boardUniversity: p.twelfthCouncilBoard || '',
          schoolCollege: p.twelfthSchoolCollegeName || '',
          passingYear: p.twelfthPassingYear || '',
          percentage: p.twelfthPercentage || '',
        }
      : null,

    p.graduationDegree || p.degreeUniversityName
      ? {
          qualification: 'Graduation',
          stream: p.graduationDegree || '',
          boardUniversity: p.degreeUniversityName || '',
          schoolCollege: p.degreeCollegeName || '',
          passingYear: p.degreePassingYear || '',
          percentage: p.graduationPercentage || p.degreeEquivalentPercentage || '',
        }
      : null,

    p.diplomaCourseName
      ? {
          qualification: 'Diploma',
          stream: p.diplomaCourseName,
          boardUniversity: p.diplomaBoardUniversity || '',
          schoolCollege: p.diplomaCollegeName || '',
          passingYear: p.diplomaPassingYear || '',
          percentage: p.diplomaPercentage || '',
        }
      : null,

    p.pgDegreeName
      ? {
          qualification: 'Post Graduation',
          stream: p.pgDegreeName,
          boardUniversity: p.pgUniversityName || '',
          schoolCollege: p.pgCollegeName || '',
          passingYear: p.pgPassingYear || '',
          percentage: p.pgPercentage || '',
        }
      : null,

    p.phdSpecialization
      ? {
          qualification: 'Ph.D.',
          stream: p.phdSpecialization,
          boardUniversity: p.phdUniversity || '',
          schoolCollege: '',
          passingYear: p.phdPassingYear || '',
          percentage: '',
        }
      : null,
  ].filter(
    (item): item is NonNullable<typeof item> => item !== null
  );

  const presentAddress = [
    p.address,
    p.landmark,
    p.panchayat,
    p.postOffice,
    p.policeStation,
    p.blockUlb,
    p.district,
    p.state,
    p.pincode,
  ]
    .filter(Boolean)
    .join(', ');

  const permanentAddress = [
    p.permanentAddress,
    p.permanentLandmark,
    p.permanentPanchayat,
    p.permanentPostOffice,
    p.permanentPoliceStation,
    p.district,
    p.state,
    p.pincode,
  ]
    .filter(Boolean)
    .join(', ');

  const resumeRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    const element = resumeRef.current;

    if (!element) {
      alert('PDF Error: Resume preview not found.');
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 15000,
        onclone: (clonedDocument) => {
          const elements = clonedDocument.querySelectorAll('*');

          elements.forEach((node) => {
            const el = node as HTMLElement;
            const computed = clonedDocument.defaultView?.getComputedStyle(el);

            if (!computed) return;

            if (computed.color.includes('oklch')) {
              el.style.color = '#0f172a';
            }

            if (computed.backgroundColor.includes('oklch')) {
              el.style.backgroundColor = '#ffffff';
            }

            if (computed.borderTopColor.includes('oklch')) {
              el.style.borderTopColor = '#cbd5e1';
            }

            if (computed.borderRightColor.includes('oklch')) {
              el.style.borderRightColor = '#cbd5e1';
            }

            if (computed.borderBottomColor.includes('oklch')) {
              el.style.borderBottomColor = '#cbd5e1';
            }

            if (computed.borderLeftColor.includes('oklch')) {
              el.style.borderLeftColor = '#cbd5e1';
            }

            if (computed.boxShadow.includes('oklch')) {
              el.style.boxShadow = 'none';
            }

            if (computed.textShadow.includes('oklch')) {
              el.style.textShadow = 'none';
            }
          });
        },
      });

      if (!canvas.width || !canvas.height) {
        throw new Error('Resume image could not be created.');
      }

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pageWidth = 210;
      const pageHeight = 297;

      const margin = 0;
      const imageWidth = pageWidth;
      const imageHeight =
        (canvas.height * imageWidth) / canvas.width;

      let heightLeft = imageHeight;
      let position = 0;

      const imageData = canvas.toDataURL('image/jpeg', 0.9);

      pdf.addImage(
        imageData,
        'JPEG',
        margin,
        position,
        imageWidth,
        imageHeight,
        undefined,
        'FAST'
      );

      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imageHeight;

        pdf.addPage();

        pdf.addImage(
          imageData,
          'JPEG',
          margin,
          position,
          imageWidth,
          imageHeight,
          undefined,
          'FAST'
        );

        heightLeft -= pageHeight;
      }

      const safeName =
        (name || 'Resume')
          .replace(/[^a-z0-9]+/gi, '_')
          .replace(/^_+|_+$/g, '') || 'Resume';

      pdf.save(`${safeName}_Resume.pdf`);

    } catch (error) {
      console.error('PDF generation failed:', error);

      let message = 'Unknown PDF generation error.';

      if (error instanceof Error) {
        message = error.message || error.name || message;
      } else if (typeof error === 'string') {
        message = error;
      } else {
        try {
          message = JSON.stringify(error);
        } catch {
          message = String(error);
        }
      }

      alert(`PDF Error: ${message}`);
    }
  };

  return (
    <div className="bg-slate-100 dark:bg-slate-950 py-6">
      <div className="w-full max-w-[210mm] mx-auto flex justify-end mb-3">
        <button
          type="button"
          onClick={downloadPDF}
          className="px-5 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold shadow-md hover:bg-slate-700 transition"
        >
          DOWNLOAD PDF
        </button>
      </div>

      <div className="w-full overflow-x-auto flex justify-center px-2 sm:px-0">
        <div
          ref={resumeRef}
          className="bg-white text-slate-900 shadow-2xl mb-6 origin-top"
          style={{
            ['--resume-scale' as any]: resumeScale,
            width: '210mm',
            minWidth: '210mm',
            minHeight: '297mm',
            padding: '15mm 17mm',
            fontFamily: 'Arial, Helvetica, sans-serif',
            boxSizing: 'border-box',
            transform: 'scale(var(--resume-scale, 1))',
            transformOrigin: 'top center',
          }}
        >

        {/* HEADER */}
        <div className="border-b-[3px] border-slate-800 pb-5 mb-6">
          <div className="flex items-center gap-6">

            {photo ? (
              <div className="shrink-0">
                <img
                  src={photo}
                  alt="Profile"
                  className="w-[105px] h-[125px] object-cover border-2 border-slate-700 rounded-md"
                />
              </div>
            ) : (
              <div className="w-[105px] h-[125px] border-2 border-slate-300 rounded-md flex items-center justify-center text-[11px] text-slate-400 shrink-0">
                PHOTO
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-[29px] font-bold uppercase tracking-wide text-slate-900">
                {name || 'RESUME'}
              </h1>

              <div className="mt-3 space-y-1">
                {email && (
                  <div className="text-[13px]">
                    <strong>E-mail:</strong> {email}
                  </div>
                )}

                {mobile && (
                  <div className="text-[13px]">
                    <strong>Mobile:</strong> {mobile}
                  </div>
                )}

                {p.state && (
                  <div className="text-[13px]">
                    <strong>Location:</strong> {p.state}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CAREER OBJECTIVE */}
        <Section title="CAREER OBJECTIVE">
          <p className="text-[13px] leading-6 text-justify">
            {careerObjective}
          </p>
        </Section>

        {/* PERSONAL DETAILS */}
        <Section title="PERSONAL DETAILS">
          <div className="grid grid-cols-2 gap-x-10 gap-y-2">
            <Field label="Full Name" value={name} />
            <Field label="Father Name" value={p.fatherName} />
            <Field label="Gender" value={p.gender} />
            <Field label="Date of Birth" value={p.dob} />
            <Field label="Nationality" value={p.nationality} />
            <Field label="Religion" value={p.religion} />
            {languages.length > 0 && (
              <Field
                label="Languages"
                value={languages.join(', ')}
              />
            )}
            {hobbies.length > 0 && (
              <Field
                label="Hobbies"
                value={hobbies.join(', ')}
              />
            )}
          </div>
        </Section>

        {/* ADDRESS */}
        {(presentAddress || permanentAddress) && (
          <Section title="ADDRESS">
            <div className="grid grid-cols-2 gap-8">

              {presentAddress && (
                <div className="border border-slate-300 rounded-md p-3">
                  <div className="font-bold text-[13px] mb-2 text-slate-800">
                    PRESENT ADDRESS
                  </div>
                  <p className="text-[13px] leading-5">
                    {presentAddress}
                  </p>
                  <div className="text-[12px] mt-2">
                    <strong>Country:</strong> India
                  </div>
                </div>
              )}

              {permanentAddress && (
                <div className="border border-slate-300 rounded-md p-3">
                  <div className="font-bold text-[13px] mb-2 text-slate-800">
                    PERMANENT ADDRESS
                  </div>
                  <p className="text-[13px] leading-5">
                    {permanentAddress}
                  </p>
                  <div className="text-[12px] mt-2">
                    <strong>Country:</strong> India
                  </div>
                </div>
              )}

            </div>
          </Section>
        )}

        {/* EDUCATION */}
        {education.length > 0 && (
          <Section title="EDUCATION QUALIFICATION">
            <table className="w-full border-collapse border border-slate-700 text-[11px]">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-700 px-2 py-2 text-left">
                    Qualification
                  </th>
                  <th className="border border-slate-700 px-2 py-2 text-left">
                    Stream
                  </th>
                  <th className="border border-slate-700 px-2 py-2 text-left">
                    Board / University
                  </th>
                  <th className="border border-slate-700 px-2 py-2 text-left">
                    School / College
                  </th>
                  <th className="border border-slate-700 px-2 py-2 text-left">
                    Year
                  </th>
                  <th className="border border-slate-700 px-2 py-2 text-left">
                    %
                  </th>
                </tr>
              </thead>

              <tbody>
                {education.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-slate-700 px-2 py-2 align-top">
                      {item.qualification}
                    </td>
                    <td className="border border-slate-700 px-2 py-2 align-top">
                      {item.stream || '-'}
                    </td>
                    <td className="border border-slate-700 px-2 py-2 align-top">
                      {item.boardUniversity || '-'}
                    </td>
                    <td className="border border-slate-700 px-2 py-2 align-top">
                      {item.schoolCollege || '-'}
                    </td>
                    <td className="border border-slate-700 px-2 py-2 align-top">
                      {item.passingYear || '-'}
                    </td>
                    <td className="border border-slate-700 px-2 py-2 align-top">
                      {item.percentage
                        ? `${item.percentage}%`
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        )}

        {/* EXTRA QUALIFICATION */}
        {otherQualifications.length > 0 && (
          <Section title="EXTRA QUALIFICATION">
            <ul className="list-disc list-inside text-[13px] leading-6">
              {otherQualifications.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </Section>
        )}

        {/* WORK EXPERIENCE */}
        {experience.length > 0 && (
          <Section title="WORK EXPERIENCE">
            <ul className="list-disc list-inside text-[13px] leading-6">
              {experience.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </Section>
        )}

        {/* DECLARATION */}
        <Section title="DECLARATION">
          <p className="text-[13px] leading-6 text-justify">
            {p.declaration?.trim() ||
              'I hereby declare that the information provided above is true and correct to the best of my knowledge and belief.'}
          </p>
        </Section>

        {/* SIGNATURE AREA */}
        <div className="mt-16 grid grid-cols-2 text-[13px]">
          <div>
            <div className="mb-8">
              <strong>DATE:</strong> ____________________
            </div>

            <div>
              <strong>PLACE:</strong> ___________________
            </div>
          </div>

          <div className="text-right">
            <div className="mb-10">
              __________________________
            </div>
            <strong>Signature</strong>
          </div>
        </div>
        </div>
      </div>

    </div>
  );
};






























