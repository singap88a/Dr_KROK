import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  FaBriefcase, FaMapMarkerAlt, FaClock, FaUser, FaEnvelope, 
  FaPhone, FaWhatsapp, FaGraduationCap, FaMoneyBillWave, 
  FaCloudUploadAlt, FaFilePdf, FaImage, FaTrash, FaPaperPlane,
  FaRocket, FaChevronRight, FaCalendarAlt
} from "react-icons/fa";
import { useApi } from "../../context/ApiContext";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import { toast } from "react-toastify";

const Jobs = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getJobs, submitJobApplication, getAuthToken } = useApi();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [files, setFiles] = useState({ photo: null, cv: null });

  const photoInputRef = useRef(null);
  const cvInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "", age: "", country: "", city: "", email: "", phone: "",
    whatsapp: "", degree: "", specialization: "", job_title: "",
    experience_years: "", current_salary: "", expected_salary: "",
    notes: "", available_from: "", job_id: ""
  });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await getJobs();
        if (res.success) {
          const fetchedJobs = res.data || [];
          setJobs(fetchedJobs);
          
          const jobId = searchParams.get("job_id");
          if (jobId) {
            const job = fetchedJobs.find(j => j.id.toString() === jobId);
            if (job) handleSelectJob(job);
            else handleSelectJob(null);
          } else {
            handleSelectJob(null);
          }
        }
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [getJobs, i18n.language]);

  const handleSelectJob = (job) => {
    setSelectedJob(job);
    setIsExpanded(false);
    const title = job ? (job.name || job.title || cleanDescription(job.description).split('.')[0]) : "General Application";
    setFormData(prev => ({
      ...prev,
      job_id: job ? job.id : "",
      job_title: title
    }));
    if (job) setSearchParams({ job_id: job.id });
    else setSearchParams({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) setFiles(prev => ({ ...prev, [type]: file }));
  };

  const removeFile = (type) => {
    setFiles(prev => ({ ...prev, [type]: null }));
    if (type === 'photo' && photoInputRef.current) photoInputRef.current.value = '';
    if (type === 'cv' && cvInputRef.current) cvInputRef.current.value = '';
  };

  const cleanDescription = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/\t|\r|\n/g, ' ').trim();
  };

  const renderDescription = (text) => {
    if (!text) return null;
    
    if (text.includes('<p>') || text.includes('<br>') || text.includes('<li>')) {
      return <div dangerouslySetInnerHTML={{ __html: text }} className="prose dark:prose-invert prose-sm max-w-none text-text-secondary" />;
    }

    const lines = text.split(/\r?\n/);
    let elements = [];
    let currentList = [];

    lines.forEach((line, index) => {
      if (line.trim() === '') return;

      if (line.startsWith('\t') || line.startsWith('  ') || line.trim().startsWith('-') || line.trim().startsWith('•')) {
        currentList.push(
          <li key={`li-${index}`} className="ml-5 list-disc text-text-secondary leading-relaxed">
            {line.replace(/^[\t\s\-•]+/, '').trim()}
          </li>
        );
      } else {
        if (currentList.length > 0) {
          elements.push(<ul key={`ul-${index}`} className="mb-4 space-y-1.5">{currentList}</ul>);
          currentList = [];
        }
        elements.push(
          <h3 key={`p-${index}`} className="font-bold text-text mt-6 mb-3 text-[15px]">
            {line.trim()}
          </h3>
        );
      }
    });

    if (currentList.length > 0) {
      elements.push(<ul key={`ul-end`} className="mb-4 space-y-1.5">{currentList}</ul>);
    }

    return <div className="text-sm">{elements}</div>;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = getAuthToken();
    if (!token) {
      toast.info(t("auth.loginRequiredToApply", { defaultValue: "Please login or create an account to submit your application" }));
      navigate("/login");
      return;
    }

    if (!files.cv) {
      toast.error(t("jobs.form.cvRequired", { defaultValue: "Please upload your CV" }));
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      if (files.photo) data.append("photo", files.photo);
      if (files.cv) data.append("cv", files.cv);

      const res = await submitJobApplication(data);
      if (res.success) {
        navigate("/application-success");
      } else {
        toast.error(res.message || "Failed to submit application");
      }
    } catch (error) {
      const errorData = error?.data;
      if (errorData?.errors && Object.keys(errorData.errors).length > 0) {
        // Display each validation error individually
        Object.values(errorData.errors).flat().forEach(msg => {
          toast.error(msg, { duration: 5000 });
        });
      } else {
        const msg = errorData?.message || error?.message || "An error occurred. Please try again.";
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-background"><LoadingSpinner /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950  flex flex-col md:flex-row transition-colors duration-300">
      
      {/* Sidebar - Jobs Navigation */}
      <aside className="w-full md:w-[280px] lg:w-[320px] flex-shrink-0 bg-white dark:bg-gray-900 border-r border-border/50 md:sticky md:top-20 md:h-[calc(100vh-80px)] overflow-y-auto scrollbar-hide z-10">
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2.5 px-1 pt-1 pb-2 border-b border-border/40">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <FaBriefcase className="text-primary text-sm" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text leading-none">{t("jobs.title")}</h2>
              <p className="text-[10px] text-text-secondary opacity-50 mt-0.5">Open positions</p>
            </div>
          </div>

          {/* General Application Button */}
          <button
            onClick={() => handleSelectJob(null)}
            className={`w-full px-3 py-2.5 rounded-xl border transition-all duration-300 flex items-center gap-3 text-left ${
              selectedJob === null 
                ? "bg-primary border-primary shadow-md shadow-primary/20 text-white" 
                : "bg-gray-50 dark:bg-gray-800/60 border-border/40 hover:border-primary/30 text-text"
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              selectedJob === null ? "bg-white/20" : "bg-primary/10 text-primary"
            }`}>
              <FaRocket className="text-xs" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-xs truncate">{t("jobs.generalApply")}</p>
              <p className={`text-[10px] opacity-60 ${selectedJob === null ? "text-white" : "text-text-secondary"}`}>Open application</p>
            </div>
          </button>

          {/* Available Jobs */}
          {jobs.length > 0 && (
            <div className="space-y-1.5">
              <p className="px-1 text-[10px] font-semibold text-text-secondary opacity-40 uppercase tracking-wider">Available Roles</p>
              {jobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => handleSelectJob(job)}
                  className={`w-full px-3 py-2.5 rounded-xl border transition-all duration-300 text-left flex items-center gap-3 group ${
                    selectedJob?.id === job.id
                      ? "bg-white dark:bg-gray-800 border-primary/30 shadow-md shadow-black/5 ring-2 ring-primary/10"
                      : "border-border/30 hover:bg-gray-50 dark:hover:bg-gray-800/40 hover:border-border/60"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img 
                      src={job.image} alt="" 
                      className="w-9 h-9 rounded-lg object-cover border border-border/40"
                      onError={(e) => { e.target.style.display='none'; }}
                    />
                    {selectedJob?.id === job.id && (
                      <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full border border-white dark:border-gray-800 animate-pulse"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-xs truncate transition-colors ${selectedJob?.id === job.id ? "text-primary" : "text-text"}`}>
                      {job.name || job.title || cleanDescription(job.description).split('.')[0]}
                    </p>
                    <p className="text-[10px] text-text-secondary opacity-50 mt-0.5 truncate">
                      {cleanDescription(job.description).split('.')[1]?.trim() || "View details"}
                    </p>
                  </div>
                  <FaChevronRight className={`text-[9px] flex-shrink-0 transition-all duration-200 ${selectedJob?.id === job.id ? "text-primary opacity-100 translate-x-0.5" : "opacity-0"}`} />
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content - Form */}
      <main className="flex-1 overflow-y-auto pt-10">
        <div className="px-4 md:px-8 lg:px-12 py-8">
          
          {/* Job Header */}
          <div className="mb-6 space-y-3">
            <h1 className="text-2xl md:text-3xl font-bold text-text leading-tight">
              {selectedJob ? (selectedJob.name || selectedJob.title || cleanDescription(selectedJob.description).split('.')[0]) : t("jobs.generalApply")}
            </h1>
            {selectedJob && (
              <div className="relative">
                <div 
                  className={`transition-all duration-300 ${!isExpanded ? "max-h-[250px] overflow-hidden relative" : ""}`}
                >
                  {renderDescription(selectedJob.description)}
                  {!isExpanded && selectedJob.description && selectedJob.description.length > 250 && (
                    <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-gray-50 dark:from-gray-950 to-transparent pointer-events-none"></div>
                  )}
                </div>
                {selectedJob.description && selectedJob.description.length > 250 && (
                  <button 
                    onClick={() => setIsExpanded(!isExpanded)} 
                    className="mt-2 text-primary text-sm font-semibold hover:underline"
                  >
                    {isExpanded ? "Show Less" : "Show More"}
                  </button>
                )}
              </div>
            )}
            {!selectedJob && (
              <p className="text-sm text-text-secondary opacity-60 max-w-xl">
                Join our vision and contribute to the future of medical education.
              </p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl border border-border/50 shadow-sm overflow-hidden">
            <div className="p-6 md:p-8 space-y-8">
              
              {/* Personal & Contact Info - 2 columns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <SectionTitle icon={<FaUser />} title={t("jobs.form.personalInfo")} />
                  <div className="grid grid-cols-2 gap-3">
                    <FieldInput label={t("jobs.form.name")} name="name" icon={<FaUser />} value={formData.name} onChange={handleInputChange} required placeholder="e.g. Ivan Petrenko" />
                    <FieldInput label={t("jobs.form.age")} name="age" type="number" icon={<FaCalendarAlt />} value={formData.age} onChange={handleInputChange} required placeholder="e.g. 28" />
                    <FieldInput label={t("jobs.form.country")} name="country" icon={<FaMapMarkerAlt />} value={formData.country} onChange={handleInputChange} required placeholder="e.g. Ukraine" />
                    <FieldInput label={t("jobs.form.city")} name="city" icon={<FaMapMarkerAlt />} value={formData.city} onChange={handleInputChange} required placeholder="e.g. Kyiv" />
                  </div>
                </div>

                <div className="space-y-5">
                  <SectionTitle icon={<FaEnvelope />} title={t("jobs.form.contactInfo")} />
                  <div className="grid grid-cols-2 gap-3">
                    <FieldInput label={t("jobs.form.email")} name="email" type="email" icon={<FaEnvelope />} value={formData.email} onChange={handleInputChange} required placeholder="email@example.com" />
                    <FieldInput label={t("jobs.form.phone")} name="phone" type="tel" icon={<FaPhone />} value={formData.phone} onChange={handleInputChange} required placeholder="+380 9x xxx xxxx" />
                    <FieldInput label={t("jobs.form.whatsapp")} name="whatsapp" type="tel" icon={<FaWhatsapp />} value={formData.whatsapp} onChange={handleInputChange} required placeholder="+380 9x xxx xxxx" />
                    <FieldInput label={t("jobs.form.availableFrom")} name="available_from" type="date" icon={<FaCalendarAlt />} value={formData.available_from} onChange={handleInputChange} />
                  </div>
                </div>
              </div>

              {/* Professional Info */}
              <div className="space-y-5">
                <SectionTitle icon={<FaBriefcase />} title={t("jobs.form.professionalInfo")} />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <FieldInput label={t("jobs.form.degree")} name="degree" icon={<FaGraduationCap />} value={formData.degree} onChange={handleInputChange} required placeholder="e.g. Bachelor's" />
                  <FieldInput label={t("jobs.form.specialization")} name="specialization" icon={<FaGraduationCap />} value={formData.specialization} onChange={handleInputChange} required placeholder="e.g. Medicine" />
                  <FieldInput label={t("jobs.form.experienceYears")} name="experience_years" type="number" icon={<FaClock />} value={formData.experience_years} onChange={handleInputChange} required placeholder="e.g. 3" />
                  <FieldInput label={t("jobs.form.currentSalary")} name="current_salary" type="number" icon={<FaMoneyBillWave />} value={formData.current_salary} onChange={handleInputChange} placeholder="e.g. 15000" />
                  <FieldInput label={t("jobs.form.expectedSalary")} name="expected_salary" type="number" icon={<FaMoneyBillWave />} value={formData.expected_salary} onChange={handleInputChange} required placeholder="e.g. 20000" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-text-secondary">{t("jobs.form.notes")}</label>
                  <textarea
                    name="notes" value={formData.notes} onChange={handleInputChange} rows="3"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none text-sm text-text placeholder:text-text-secondary/40"
                    placeholder="Briefly describe your interest and relevant experience..."
                  ></textarea>
                </div>
              </div>

              {/* Attachments */}
              <div className="space-y-5">
                <SectionTitle icon={<FaCloudUploadAlt />} title={t("jobs.form.attachments")} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CompactFileField 
                    label={t("jobs.form.photo")} type="photo" accept="image/*" 
                    file={files.photo} inputRef={photoInputRef} onFileChange={handleFileChange}
                    removeFile={removeFile} icon={<FaImage className="text-base" />} t={t}
                  />
                  <CompactFileField 
                    label={t("jobs.form.cv")} type="cv" accept=".pdf,.doc,.docx" 
                    file={files.cv} inputRef={cvInputRef} onFileChange={handleFileChange}
                    removeFile={removeFile} icon={<FaFilePdf className="text-base" />} t={t}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit" disabled={submitting}
                className={`flex items-center justify-center gap-2.5 px-8 py-3 bg-primary text-white text-sm font-semibold rounded-xl shadow-md shadow-primary/20 transition-all ${submitting ? 'opacity-70 cursor-not-allowed' : 'hover:brightness-110 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98]'}`}
              >
                {submitting 
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  : <FaPaperPlane className="text-xs" />
                }
                {submitting ? "Submitting..." : t("jobs.form.submit")}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

const SectionTitle = ({ icon, title }) => (
  <div className="flex items-center gap-2.5 text-primary border-b border-border/30 pb-2.5">
    <span className="text-base opacity-80">{icon}</span>
    <h3 className="text-sm font-semibold text-text">{title}</h3>
  </div>
);

const FieldInput = ({ label, icon, placeholder, ...props }) => (
  <div className="space-y-1.5">
    <label className="block text-[13px] font-medium text-text-secondary">{label}</label>
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary/80 transition-colors text-xs">
        {icon}
      </div>
      <input
        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-text placeholder:text-text-secondary/40"
        placeholder={placeholder}
        {...props}
      />
    </div>
  </div>
);

const CompactFileField = ({ label, file, inputRef, onFileChange, removeFile, icon, t, type }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-medium text-text-secondary">{label}</label>
    <div 
      onClick={() => inputRef.current.click()}
      className={`relative h-24 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group ${file ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 bg-gray-50 dark:bg-gray-800/30'}`}
    >
      <input type="file" ref={inputRef} className="hidden" onChange={(e) => onFileChange(e, type)} />
      {file ? (
        <div className="flex items-center gap-3 w-full px-4 animate-fadeIn">
          {type === 'photo' ? (
            <img src={URL.createObjectURL(file)} className="w-10 h-10 object-cover rounded-lg border border-border/40" alt="Preview" />
          ) : (
            <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center text-primary border border-border/40">{icon}</div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-text truncate">{file.name}</p>
            <p className="text-[10px] text-text-secondary">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); removeFile(type); }} 
            className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <FaTrash size={10} />
          </button>
        </div>
      ) : (
        <div className="text-center opacity-40 group-hover:opacity-80 transition-all flex flex-col items-center gap-1">
          <div className="text-primary">{icon}</div>
          <p className="text-[10px] text-text-secondary">{t("jobs.form.dragDrop")}</p>
        </div>
      )}
    </div>
  </div>
);

export default Jobs;
