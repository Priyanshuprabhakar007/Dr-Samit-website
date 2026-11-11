/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { TREATMENTS_DATA, CLINIC_INFO, TreatmentItem } from '../data/surgeryData';
export type { TreatmentItem };

// Types
export interface EnquiryRecord {
  id?: string;
  referenceCode: string;
  fullName: string;
  email: string;
  phone: string;
  treatmentInterest: string;
  consultationType: 'in-person' | 'virtual';
  preferredDate: string;
  preferredTime: string;
  clinicalNotes?: string;
  status: 'new' | 'contacted' | 'scheduled' | 'closed';
  createdAt: string;
  updatedAt?: string;
  adminNotes?: string;
}

export interface HomepageData {
  sectionVisibility?: {
    hero?: boolean;
    aboutPreview?: boolean;
    treatments?: boolean;
    approach?: boolean;
    patientGuide?: boolean;
    finalCta?: boolean;
  };
  sectionsOrder?: string[];
  hero: {
    eyebrow: string;
    headlinePart1: string;
    headlineHighlight: string;
    description: string;
    primaryCtaLabel: string;
    primaryCtaLink: string;
    secondaryCtaLabel: string;
    secondaryCtaLink: string;
    heroImage: string;
    backgroundImage?: string;
    imagePosition?: 'object-top' | 'object-center' | 'object-bottom';
    overlayIntensity?: number;
  };
  aboutPreview: {
    doctorName: string;
    qualificationTitle: string;
    fellowshipHighlight: string;
    hospitalName: string;
    department: string;
    previewSummary: string;
    portraitImage: string;
    architecturalImage: string;
    buttonLabel?: string;
    buttonLink?: string;
    degreesList?: string[];
    fellowshipsList?: string[];
  };
  treatmentsShowcase?: {
    title: string;
    subtitle: string;
    description: string;
    featuredSlugs?: string[];
    customImages?: Record<string, string>;
  };
  approach: {
    headline: string;
    subheadline: string;
    description: string;
    image: string;
    backgroundSetting?: 'onyx' | 'charcoal';
    pillars?: Array<{
      number: string;
      title: string;
      description: string;
      highlight: string;
    }>;
  };
  finalCta: {
    eyebrow: string;
    headline: string;
    description: string;
    ctaLabel: string;
    backgroundImage: string;
    bookingDestination?: string;
  };
  updatedAt?: string;
  updatedBy?: string;
  lastPublishedAt?: string;
  lastPublishedBy?: string;
}

export interface HomepageRevision {
  id: string;
  publishedAt: string;
  publishedBy: string;
  snapshot: HomepageData;
  note?: string;
}

export interface AboutData {
  doctorName: string;
  title: string;
  primaryHospital: string;
  location: string;
  portraitImage: string;
  architecturalImage: string;
  biography: string[];
  qualifications: Array<{
    degree: string;
    institution: string;
    year?: string;
  }>;
  fellowships: string[];
  memberships: string[];
  specialties: string[];
  updatedAt?: string;
  updatedBy?: string;
}

export interface BlogPost {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  readTime: string;
  author: string;
  status: 'draft' | 'published';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClinicSettings {
  hospitalName: string;
  department: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  phone: string;
  emergencyPhone: string;
  email: string;
  whatsappNumber: string;
  instagramHandle: string;
  consultationDeskNote: string;
  enableOnlineBooking: boolean;
  updatedAt?: string;
}

export interface AuditRecord {
  id?: string;
  action: string;
  resource: string;
  resourceId?: string;
  performedBy: string;
  timestamp: string;
  details?: string;
}

// Default Fallback Data
export const DEFAULT_HOMEPAGE: HomepageData = {
  sectionVisibility: {
    hero: true,
    aboutPreview: true,
    treatments: true,
    approach: true,
    patientGuide: true,
    finalCta: true,
  },
  sectionsOrder: ['hero', 'aboutPreview', 'treatments', 'approach', 'patientGuide', 'finalCta'],
  hero: {
    eyebrow: 'PLASTIC | COSMETIC | RECONSTRUCTIVE SURGERY',
    headlinePart1: 'RESHAPING FORM, RESTORING ',
    headlineHighlight: 'CONFIDENCE',
    description:
      'Precision aesthetic craftsmanship led by Dr. Samik Sharma at Shalby Hospital, Mohali. International surgical fellowship standards harmonized with anatomical harmony and patient safety.',
    primaryCtaLabel: 'Book a Consultation',
    primaryCtaLink: '#book',
    secondaryCtaLabel: 'Explore Treatments',
    secondaryCtaLink: '/treatments',
    heroImage: '/src/assets/images/hero_editorial_beauty_1794213535182.jpg',
    backgroundImage: '',
    imagePosition: 'object-top',
    overlayIntensity: 70,
  },
  aboutPreview: {
    doctorName: 'Dr. Samik Sharma',
    qualificationTitle: 'Senior Consultant Plastic & Aesthetic Surgeon',
    fellowshipHighlight: 'UK Fellowship Trained in Aesthetic & Craniofacial Surgery',
    hospitalName: 'Shalby Multi-Specialty Hospital, Mohali',
    department: 'Department of Plastic, Cosmetic & Reconstructive Surgery',
    previewSummary:
      'Trained extensively across premier tertiary centers in the United Kingdom, Dr. Samik Sharma delivers natural, refined surgical outcomes centered on individualized patient care and architectural precision.',
    portraitImage: '/samik-portrait.jpg',
    architecturalImage: '/src/assets/images/about_sculptural_marble_1794213536764.jpg',
    buttonLabel: 'Schedule Private Consultation',
    buttonLink: '#book',
    degreesList: [
      'M.B.B.S. — Recognized Medical University',
      'M.S. (General Surgery) — Premier Government Medical Institute',
      'M.Ch. (Plastic & Reconstructive Surgery) — Apex Super-Specialty Medical Institute',
    ],
    fellowshipsList: [
      'Fellowship in Aesthetic Plastic Surgery (Face & Body) — United Kingdom',
      'Advanced Training in Structural Rhinoplasty & Facial Contouring',
      'Clinical Observership in Microvascular Surgery',
    ],
  },
  treatmentsShowcase: {
    title: 'Clinical Procedures & Contouring',
    subtitle: 'SURGICAL DISCIPLINES',
    description:
      'Tailored surgical interventions designed to restore balance, contour, and structural vitality with discreet, undetectable refinement.',
    featuredSlugs: ['rhinoplasty', 'facelift-necklift', 'blepharoplasty', 'liposuction', 'tummy-tuck', 'hair-transplant'],
    customImages: {},
  },
  approach: {
    headline: 'Precise. Personalised. Natural.',
    subheadline: 'OUR METHODOLOGY',
    description:
      'Aesthetic surgery at its highest echelon is quiet, balanced, and imperceptible. Our clinical protocol centers on structural preservation rather than artificial exaggeration.',
    image: '/src/assets/images/approach_sculptural_profile_1794213536894.jpg',
    backgroundSetting: 'onyx',
    pillars: [
      {
        number: '01',
        title: 'Anatomical Proportion',
        description: 'Every procedure is customized to respect your individual skeletal harmony and natural facial architecture.',
        highlight: 'Individualized Blueprint',
      },
      {
        number: '02',
        title: 'Structural Preservation',
        description: 'Preserving foundational support frameworks rather than destructive over-resection ensures lasting, timeless results.',
        highlight: 'Deep Plane & Cartilage Integrity',
      },
      {
        number: '03',
        title: 'Tertiary Hospital Safety',
        description: 'All surgical interventions are performed in Shalby Hospital’s NABH-accredited laminar airflow modular operation suites.',
        highlight: 'World-Class Clinical Standards',
      },
      {
        number: '04',
        title: 'Patient-First Transparency',
        description: 'Uncompromising pre-operative photographic analysis, clear recovery milestones, and conservative surgical guidance.',
        highlight: 'Informed, Compassionate Care',
      },
    ],
  },
  finalCta: {
    eyebrow: 'YOUR TRANSFORMATION BEGINS HERE',
    headline: 'BOOK A CONSULTATION',
    description:
      'Embark on a discreet, personalized aesthetic journey under the surgical leadership of Dr. Samik Sharma. Confidential consultations hosted in tertiary suites at Shalby Hospital, Mohali or via secure teleconsultation.',
    ctaLabel: 'Request In-Person or Tele-Consultation',
    backgroundImage: '/src/assets/images/cta_bronze_silk_1794213538249.jpg',
    bookingDestination: '#contact',
  },
};

export const DEFAULT_ABOUT: AboutData = {
  doctorName: 'Dr. Samik Sharma',
  title: 'Consultant Plastic, Cosmetic & Reconstructive Surgeon',
  primaryHospital: 'Shalby Hospital, Mohali',
  location: 'Sector 71, SAS Nagar, Punjab',
  portraitImage: '/samik-portrait.jpg',
  architecturalImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
  biography: [
    'Dr. Samik Sharma is a distinguished Consultant Plastic, Cosmetic & Reconstructive Surgeon practicing at Shalby Multi-Specialty Hospital, Mohali. With rigorous super-specialist M.Ch. training and advanced international clinical exposure, Dr. Sharma represents the new generation of precision aesthetic surgeons.',
    'His clinical philosophy prioritizes natural aesthetic restoration, patient safety, and comprehensive pre-operative photographic evaluation. He approaches every procedure—from delicate rhinoplasty to transformative body contouring—with meticulous architectural planning and surgical finesse.',
    'At Shalby Hospital, Dr. Sharma leads modern aesthetic suites equipped with laminar airflow operation theatres, high-definition endoscopic systems, and dedicated recovery suites for total patient privacy and post-operative comfort.',
  ],
  qualifications: [
    { degree: 'M.B.B.S.', institution: 'Recognized Medical University', year: '2012' },
    { degree: 'M.S. (General Surgery)', institution: 'Premier Government Medical Institute', year: '2016' },
    { degree: 'M.Ch. (Plastic & Reconstructive Surgery)', institution: 'Apex National Super-Specialty Medical Institute', year: '2020' },
  ],
  fellowships: [
    'Fellowship in Aesthetic Plastic Surgery (Face & Body)',
    'Advanced Training in Structural Rhinoplasty & Facial Contouring',
    'Clinical Observership in Microvascular & Hand Reconstructive Surgery',
  ],
  memberships: [
    'Association of Plastic Surgeons of India (APSI)',
    'Indian Association of Aesthetic Plastic Surgeons (IAAPS)',
    'International Society of Aesthetic Plastic Surgery (ISAPS)',
  ],
  specialties: [
    'Aesthetic Facial Surgery (Rhinoplasty, Blepharoplasty, Facelift)',
    'High-Definition Body Contouring & Liposuction',
    'Abdominoplasty (Tummy Tuck) & Post-Bariatric Body Lift',
    'Follicular Unit Hair Restoration & Giga-Sessions',
    'Complex Trauma & Onco-Reconstructive Flap Surgery',
  ],
};

export const DEFAULT_BLOG_POSTS: BlogPost[] = [
  {
    slug: 'rhinoplasty-structural-integrity-natural-breathing',
    title: 'The Art of Structural Rhinoplasty: Natural Balance & Functional Airway',
    excerpt: 'How modern open preservation techniques maintain lifelong nasal airway stability while sculpting elegant dorsum contours.',
    content: `Rhinoplasty is widely recognized as one of the most intellectually and technically demanding operations in plastic surgery. 

Unlike purely cosmetic procedures, any modification to the nasal framework immediately impacts internal nasal valve airflow and respiratory mechanics.

### The Shift Towards Preservation and Structure
Historical rhinoplasty techniques often relied on aggressive reductive resections, frequently resulting in secondary airway collapse, pinch deformities, or an unnatural "operated" appearance years down the line.

Modern structural rhinoplasty, as practiced by Dr. Samik Sharma at Shalby Hospital, emphasizes:
1. **Preservation of Autologous Cartilaginous Grafts**: Utilizing septal or auricular cartilage struts to reinforce the nasal tip.
2. **Precision Osteotomies**: Controlled micro-cuts to reposition nasal bones without disturbing periosteal attachments.
3. **Internal Valve Reconstruction**: Employing spreader grafts or spreader flaps to maintain unobstructed nasal breathing.

### Realistic Timelines for Healing
Swelling resolves in phases:
- **Week 2**: External splint removal; patients comfortably return to social engagements.
- **Month 3**: 70% of macro-swelling subsides.
- **Month 12**: Subtle definition of the nasal tip and supra-tip break fully crystallizes.

Consultation always involves high-resolution frontal and profile photographic analysis to establish clear, personalized surgical objectives.`,
    coverImage: 'https://images.unsplash.com/photo-1512290900672-1f41639d4fae?auto=format&fit=crop&w=1200&q=85',
    category: 'Facial Aesthetics',
    readTime: '5 min read',
    author: 'Dr. Samik Sharma',
    status: 'published',
    publishedAt: '2026-03-15T10:00:00.000Z',
    createdAt: '2026-03-15T10:00:00.000Z',
    updatedAt: '2026-03-15T10:00:00.000Z',
  },
  {
    slug: 'deep-plane-vs-smas-facelift-guide',
    title: 'Modern Facial Rejuvenation: Understanding Deep Plane vs. SMAS Architecture',
    excerpt: 'An anatomical overview of how repositioning deep muscular retaining ligaments produces tension-free, enduring facial rejuvenation.',
    content: `A truly refined facial rejuvenation never looks stretched, taut, or windswept. The secret lies beneath the skin, in the Super-ficial Musculo-Aponeurotic System (SMAS) and the deep osteo-cutaneous retaining ligaments.

### Why Skin-Only Lifts Fail
Skin possesses viscoelastic properties; pulling skin under tension inevitably leads to widened scars, earlobe distortion (pixie ear), and rapid relapse. 

By contrast, liberating the zygomatic and masseteric retaining ligaments allows the midface fat pads (malar fat pads) and jowls to be restored to their youthful vectors with zero cutaneous tension.

### Candidates for Deep Facial Rejuvenation
Ideal candidates typically exhibit:
- Significant jowl formation obscuring mandibular definition
- Midface descent creating deep nasolabial creases
- Submental skin laxity and platysmal banding along the neck

Patients undergo comprehensive pre-operative screening at Shalby Hospital with custom multi-vector tissue repositioning.`,
    coverImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=85',
    category: 'Facial Aesthetics',
    readTime: '6 min read',
    author: 'Dr. Samik Sharma',
    status: 'published',
    publishedAt: '2026-03-20T11:00:00.000Z',
    createdAt: '2026-03-20T11:00:00.000Z',
    updatedAt: '2026-03-20T11:00:00.000Z',
  },
  {
    slug: 'post-pregnancy-restoration-abdominoplasty',
    title: 'The Modern Tummy Tuck: Rectus Diastasis Repair and Waistline Tapering',
    excerpt: 'How surgical plication of separated abdominal muscles combined with high-definition contouring restores torso core stability.',
    content: `Pregnancy and significant weight transitions frequently stretch the linea alba, causing permanent separation of the rectus abdominis muscles (diastasis recti). No amount of core exercise can fuse separated fibrous fascial tissue back together.

### The Triad of Modern Abdominoplasty
1. **Internal Internal Corset Plication**: Re-approximating the rectus fascia in two layers to flatten the abdominal wall and narrow the waistline.
2. **Selective Liposuction (Lipoabdominoplasty)**: Refining the flank and love handle contours simultaneously.
3. **Natural Umbilicoplasty**: Designing an inverted, vertically oriented umbilicus with concealed internal sutures rather than a round, artificial ring scar.

All procedures are conducted in the sterile hospital environment of Shalby Hospital, Mohali, backed by advanced post-operative pain protocols and early mobilization regimens.`,
    coverImage: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=85',
    category: 'Body Contouring',
    readTime: '5 min read',
    author: 'Dr. Samik Sharma',
    status: 'published',
    publishedAt: '2026-03-25T09:30:00.000Z',
    createdAt: '2026-03-25T09:30:00.000Z',
    updatedAt: '2026-03-25T09:30:00.000Z',
  },
];

export const DEFAULT_SETTINGS: ClinicSettings = {
  hospitalName: CLINIC_INFO.hospital,
  department: 'Department of Plastic, Cosmetic & Reconstructive Surgery',
  address: 'Shalby Multi-Specialty Hospital, Sector 71',
  city: 'Mohali',
  state: 'Punjab',
  pincode: '160071',
  country: 'India',
  phone: CLINIC_INFO.phone,
  emergencyPhone: '+91 172 503 6666',
  email: 'appointments@drsamiksharma.com',
  whatsappNumber: '+919876543210',
  instagramHandle: '@drsamiksharma.plasticsurgery',
  consultationDeskNote: 'Prior appointment mandatory for OPD and cosmetic consultations.',
  enableOnlineBooking: true,
};

// ==========================================
// FIRESTORE CRUD OPERATIONS
// ==========================================

// Audit Logging
export async function logAudit(
  action: string,
  resource: string,
  resourceId?: string,
  details?: string,
  userEmail?: string
) {
  try {
    await addDoc(collection(db, 'audit_logs'), {
      action,
      resource,
      resourceId: resourceId || '',
      performedBy: userEmail || 'system',
      timestamp: new Date().toISOString(),
      details: details || '',
    });
  } catch (err) {
    console.warn('Audit log write error (non-blocking):', err);
  }
}

// 1. Enquiries
export async function createEnquiry(
  enquiry: Omit<EnquiryRecord, 'id' | 'referenceCode' | 'status' | 'createdAt'>
): Promise<{ success: boolean; referenceCode: string; id?: string; message?: string }> {
  let response: Response;
  try {
    response = await fetch('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enquiry),
    });
  } catch {
    throw new Error('Unable to reach the consultation service. Please try again.');
  }

  const result = await response.json().catch(() => null) as
    | { success?: boolean; referenceCode?: string; id?: string; message?: string; error?: string }
    | null;
  if (!response.ok || result?.success !== true || !result.referenceCode) {
    throw new Error(result?.error || 'Unable to save your request. Please try again.');
  }
  return { success: true, referenceCode: result.referenceCode, id: result.id, message: result.message };
}

export async function getEnquiries(): Promise<EnquiryRecord[]> {
  try {
    const q = query(collection(db, 'enquiries'), orderBy('createdAt', 'desc'), limit(100));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as EnquiryRecord),
    }));
  } catch (err) {
    console.error('Failed to fetch enquiries:', err);
    return [];
  }
}

export async function updateEnquiryStatus(
  id: string,
  status: EnquiryRecord['status'],
  adminNotes?: string,
  userEmail?: string
): Promise<boolean> {
  try {
    const docRef = doc(db, 'enquiries', id);
    const updatePayload: any = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (adminNotes !== undefined) {
      updatePayload.adminNotes = adminNotes;
    }
    await updateDoc(docRef, updatePayload);
    await logAudit('UPDATE_STATUS', 'enquiries', id, `Status updated to ${status}`, userEmail);
    return true;
  } catch (err) {
    console.error('Failed to update enquiry status:', err);
    throw err;
  }
}

export async function deleteEnquiry(id: string, userEmail?: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'enquiries', id));
    await logAudit('DELETE', 'enquiries', id, 'Deleted patient enquiry record', userEmail);
    return true;
  } catch (err) {
    console.error('Failed to delete enquiry:', err);
    throw err;
  }
}

// 2. Homepage Content
export async function getHomepageContent(status: 'published' | 'draft' = 'published'): Promise<HomepageData> {
  try {
    const docRef = doc(db, 'homepage_content', status);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as HomepageData;
    }
  } catch (err) {
    console.warn('Could not read homepage content from Firestore, using default:', err);
  }
  return DEFAULT_HOMEPAGE;
}

export async function saveHomepageContent(
  data: HomepageData,
  asPublish: boolean = false,
  userEmail?: string,
  revisionNote?: string
): Promise<boolean> {
  const now = new Date().toISOString();

  if (asPublish) {
    const publishedPayload: HomepageData = {
      ...data,
      updatedAt: now,
      updatedBy: userEmail || 'admin',
      lastPublishedAt: now,
      lastPublishedBy: userEmail || 'admin',
    };

    // Atomic sync: write both published and draft so they match
    await setDoc(doc(db, 'homepage_content', 'published'), publishedPayload);
    await setDoc(doc(db, 'homepage_content', 'draft'), publishedPayload);

    // Save immutable revision snapshot for rollback
    try {
      const revId = `rev-${Date.now()}`;
      const revisionDoc: HomepageRevision = {
        id: revId,
        publishedAt: now,
        publishedBy: userEmail || 'admin',
        snapshot: publishedPayload,
        note: revisionNote || 'Published via Visual Homepage Editor',
      };
      await setDoc(doc(db, 'homepage_revisions', revId), revisionDoc);
    } catch (revErr) {
      console.warn('Revision archive note:', revErr);
    }

    await logAudit('PUBLISH', 'homepage_content', 'published', 'Published homepage updates', userEmail);
  } else {
    const draftPayload: HomepageData = {
      ...data,
      updatedAt: now,
      updatedBy: userEmail || 'admin',
    };
    // Save draft only
    await setDoc(doc(db, 'homepage_content', 'draft'), draftPayload);
    await logAudit('SAVE_DRAFT', 'homepage_content', 'draft', 'Saved draft homepage updates', userEmail);
  }

  return true;
}

export async function getHomepageRevisions(): Promise<HomepageRevision[]> {
  try {
    const colRef = collection(db, 'homepage_revisions');
    const q = query(colRef, orderBy('publishedAt', 'desc'), limit(15));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const rawData = d.data();
      return {
        ...(rawData as Omit<HomepageRevision, 'id'>),
        id: d.id,
      } as HomepageRevision;
    });
  } catch (err) {
    console.warn('Could not read homepage revisions from Firestore:', err);
    return [];
  }
}

export async function rollbackHomepageRevision(
  revision: HomepageRevision,
  userEmail?: string
): Promise<boolean> {
  const now = new Date().toISOString();
  const restoredPayload: HomepageData = {
    ...revision.snapshot,
    updatedAt: now,
    updatedBy: userEmail || 'admin',
    lastPublishedAt: now,
    lastPublishedBy: userEmail || 'admin',
  };

  // Write restored version to published and draft
  await setDoc(doc(db, 'homepage_content', 'published'), restoredPayload);
  await setDoc(doc(db, 'homepage_content', 'draft'), restoredPayload);

  // Record rollback as a new revision point
  try {
    const revId = `rev-${Date.now()}-rollback`;
    await setDoc(doc(db, 'homepage_revisions', revId), {
      id: revId,
      publishedAt: now,
      publishedBy: userEmail || 'admin',
      snapshot: restoredPayload,
      note: `Rolled back to snapshot from ${new Date(revision.publishedAt).toLocaleString()}`,
    });
  } catch (revErr) {
    console.warn('Rollback archive note:', revErr);
  }

  await logAudit('ROLLBACK', 'homepage_content', revision.id, `Rolled back homepage to revision ${revision.id}`, userEmail);
  return true;
}

// 3. About Content
export async function getAboutContent(status: 'published' | 'draft' = 'published'): Promise<AboutData> {
  try {
    const docRef = doc(db, 'about_content', status);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as AboutData;
    }
  } catch (err) {
    console.warn('Could not read about content from Firestore, using default:', err);
  }
  return DEFAULT_ABOUT;
}

export async function saveAboutContent(
  data: AboutData,
  asPublish: boolean = false,
  userEmail?: string
): Promise<boolean> {
  const now = new Date().toISOString();
  const payload = {
    ...data,
    updatedAt: now,
    updatedBy: userEmail || 'admin',
  };

  await setDoc(doc(db, 'about_content', 'draft'), payload);

  if (asPublish) {
    await setDoc(doc(db, 'about_content', 'published'), payload);
    await logAudit('PUBLISH', 'about_content', 'published', 'Published doctor profile updates', userEmail);
  } else {
    await logAudit('SAVE_DRAFT', 'about_content', 'draft', 'Saved draft doctor profile updates', userEmail);
  }

  return true;
}

// 4. Treatments
export async function getTreatments(adminView: boolean = false): Promise<TreatmentItem[]> {
  try {
    const colRef = collection(db, 'treatments');
    const q = adminView
      ? query(colRef)
      : query(colRef, where('status', '==', 'published'));
    
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const items = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as TreatmentItem;
        return {
          ...data,
          id: docSnap.id || data.id,
        };
      });
      // Sort by order or default order
      return items.sort((a, b) => ((a as any).order ?? 0) - ((b as any).order ?? 0));
    }
  } catch (err) {
    console.warn('Could not read treatments from Firestore, fallback to static:', err);
  }

  // Fallback to static treatments data
  return TREATMENTS_DATA;
}

export async function saveTreatment(
  treatment: TreatmentItem & { status?: 'published' | 'draft' | 'archived'; order?: number },
  userEmail?: string
): Promise<boolean> {
  const slug = treatment.slug || treatment.id;
  const docRef = doc(db, 'treatments', slug);
  const payload = {
    ...treatment,
    status: treatment.status || 'published',
    updatedAt: new Date().toISOString(),
  };

  await setDoc(docRef, payload, { merge: true });
  await logAudit('SAVE_TREATMENT', 'treatments', slug, `Saved treatment: ${treatment.title}`, userEmail);
  return true;
}

export async function getTreatmentBySlug(slug: string): Promise<TreatmentItem | null> {
  try {
    const docSnap = await getDoc(doc(db, 'treatments', slug));
    if (docSnap.exists()) {
      const data = docSnap.data() as TreatmentItem;
      return { ...data, id: docSnap.id || data.id };
    }
  } catch (err) {
    console.warn(`Could not read treatment ${slug} from Firestore:`, err);
  }

  // Fallback to static
  const found = TREATMENTS_DATA.find((t) => t.slug === slug || t.id === slug);
  return found || null;
}

export async function unpublishTreatment(slug: string, userEmail?: string): Promise<boolean> {
  const docRef = doc(db, 'treatments', slug);
  await updateDoc(docRef, {
    status: 'draft',
    updatedAt: new Date().toISOString(),
  });
  await logAudit('UNPUBLISH_TREATMENT', 'treatments', slug, `Unpublished treatment ${slug} to draft`, userEmail);
  return true;
}

export async function archiveTreatment(slug: string, userEmail?: string): Promise<boolean> {
  const docRef = doc(db, 'treatments', slug);
  await updateDoc(docRef, {
    status: 'archived',
    updatedAt: new Date().toISOString(),
  });
  await logAudit('ARCHIVE_TREATMENT', 'treatments', slug, `Archived treatment ${slug}`, userEmail);
  return true;
}

export async function deleteTreatment(slug: string, userEmail?: string): Promise<boolean> {
  await deleteDoc(doc(db, 'treatments', slug));
  await logAudit('DELETE_TREATMENT', 'treatments', slug, `Deleted treatment ${slug}`, userEmail);
  return true;
}

// 5. Blog Posts
export async function getBlogPosts(adminView: boolean = false): Promise<BlogPost[]> {
  try {
    const colRef = collection(db, 'blog_posts');
    const q = adminView
      ? query(colRef, orderBy('createdAt', 'desc'))
      : query(colRef, where('status', '==', 'published'), orderBy('publishedAt', 'desc'));

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as BlogPost),
      }));
    }
  } catch (err) {
    console.warn('Could not read blog posts from Firestore, using default:', err);
  }

  return DEFAULT_BLOG_POSTS;
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const docSnap = await getDoc(doc(db, 'blog_posts', slug));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...(docSnap.data() as BlogPost) };
    }
  } catch (err) {
    console.warn(`Could not read blog post ${slug} from Firestore:`, err);
  }

  const found = DEFAULT_BLOG_POSTS.find((b) => b.slug === slug);
  return found || null;
}

export async function saveBlogPost(post: BlogPost, userEmail?: string): Promise<boolean> {
  const slug = post.slug;
  const docRef = doc(db, 'blog_posts', slug);
  const now = new Date().toISOString();

  const payload: BlogPost = {
    ...post,
    updatedAt: now,
    createdAt: post.createdAt || now,
    publishedAt: post.status === 'published' ? (post.publishedAt || now) : undefined,
  };

  await setDoc(docRef, payload, { merge: true });
  await logAudit('SAVE_BLOG', 'blog_posts', slug, `Saved blog post: ${post.title}`, userEmail);
  return true;
}

export async function unpublishBlogPost(slug: string, userEmail?: string): Promise<boolean> {
  const docRef = doc(db, 'blog_posts', slug);
  await updateDoc(docRef, {
    status: 'draft',
    updatedAt: new Date().toISOString(),
  });
  await logAudit('UNPUBLISH_BLOG', 'blog_posts', slug, `Unpublished blog post: ${slug}`, userEmail);
  return true;
}

export async function deleteBlogPost(slug: string, userEmail?: string): Promise<boolean> {
  await deleteDoc(doc(db, 'blog_posts', slug));
  await logAudit('DELETE_BLOG', 'blog_posts', slug, `Deleted blog post: ${slug}`, userEmail);
  return true;
}

// 6. Settings
export async function getSettings(): Promise<ClinicSettings> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'current'));
    if (snap.exists()) {
      return snap.data() as ClinicSettings;
    }
  } catch (err) {
    console.warn('Could not read settings from Firestore, using default:', err);
  }
  return DEFAULT_SETTINGS;
}

export async function updateSettings(settings: ClinicSettings, userEmail?: string): Promise<boolean> {
  const payload = {
    ...settings,
    updatedAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'settings', 'current'), payload, { merge: true });
  await logAudit('UPDATE_SETTINGS', 'settings', 'current', 'Updated practice and hospital settings', userEmail);
  return true;
}

// 7. Admin Users Management
export interface AdminUserRecord {
  uid: string;
  email: string;
  displayName: string;
  role: 'owner' | 'admin';
  createdAt: string;
}

export async function getAdminUsers(): Promise<AdminUserRecord[]> {
  try {
    const snapshot = await getDocs(collection(db, 'admins'));
    return snapshot.docs.map((d) => d.data() as AdminUserRecord);
  } catch (err) {
    console.error('Failed to get admin users:', err);
    return [];
  }
}

export async function addAdminUser(
  record: { uid: string; email: string; displayName: string; role: 'admin' },
  userEmail?: string
): Promise<boolean> {
  const docRef = doc(db, 'admins', record.uid);
  await setDoc(docRef, {
    ...record,
    createdAt: new Date().toISOString(),
  });
  await logAudit('ADD_ADMIN', 'admins', record.uid, `Authorized admin: ${record.email}`, userEmail);
  return true;
}

export async function removeAdminUser(uid: string, userEmail?: string): Promise<boolean> {
  await deleteDoc(doc(db, 'admins', uid));
  await logAudit('REMOVE_ADMIN', 'admins', uid, `Revoked admin UID: ${uid}`, userEmail);
  return true;
}

// 8. Audit Logs
export async function getAuditLogs(): Promise<AuditRecord[]> {
  try {
    const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as AuditRecord) }));
  } catch (err) {
    console.warn('Failed to load audit logs:', err);
    return [];
  }
}

// 9. Initial Seeder (Checks if database collections are empty and seeds them with defaults)
export async function seedInitialDataIfEmpty(userEmail?: string) {
  try {
    // Check if homepage is seeded
    const hpSnap = await getDoc(doc(db, 'homepage_content', 'published'));
    if (!hpSnap.exists()) {
      await saveHomepageContent(DEFAULT_HOMEPAGE, true, userEmail);
    }

    // Check if about is seeded
    const abSnap = await getDoc(doc(db, 'about_content', 'published'));
    if (!abSnap.exists()) {
      await saveAboutContent(DEFAULT_ABOUT, true, userEmail);
    }

    // Check if settings are seeded
    const setSnap = await getDoc(doc(db, 'settings', 'current'));
    if (!setSnap.exists()) {
      await updateSettings(DEFAULT_SETTINGS, userEmail);
    }

    // Check if treatments are seeded
    const trCol = await getDocs(collection(db, 'treatments'));
    if (trCol.empty) {
      for (let i = 0; i < TREATMENTS_DATA.length; i++) {
        const item = TREATMENTS_DATA[i];
        await saveTreatment({
          ...item,
          status: 'published',
          order: i + 1,
        }, userEmail);
      }
    }

    // Check if blog posts are seeded
    const blCol = await getDocs(collection(db, 'blog_posts'));
    if (blCol.empty) {
      for (const post of DEFAULT_BLOG_POSTS) {
        await saveBlogPost(post, userEmail);
      }
    }
  } catch (err) {
    console.warn('Initial data seeding note (rules or connection pending):', err);
  }
}
