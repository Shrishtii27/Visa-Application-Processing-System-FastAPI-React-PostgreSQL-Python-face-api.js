import enum

class UserRole(str, enum.Enum):
    user = 'user'
    admin = 'admin'

class ApplicationStatus(str, enum.Enum):
    draft = 'draft'
    submitted = 'submitted'
    under_review = 'under_review'
    approved = 'approved'
    rejected = 'rejected'

class ApplicationStep(str, enum.Enum):
    country_selection = 'country_selection'
    visa_type_selection = 'visa_type_selection'
    passport_upload = 'passport_upload'
    form_filling = 'form_filling'
    document_upload = 'document_upload'
    face_verification = 'face_verification'
    completed = 'completed'

class VisaPurpose(str, enum.Enum):
    tourist = 'tourist'
    business = 'business'
    student = 'student'
    family = 'family'
    transit = 'transit'
    work = 'work'
    medical = 'medical'
    spouse_dependent = 'spouse_dependent'
    immigrant_pr = 'immigrant_pr'
    diplomatic = 'diplomatic'
    working_holiday = 'working_holiday'
    journalist = 'journalist'
    religious = 'religious'

class DocumentStatus(str, enum.Enum):
    pending = 'pending'
    valid = 'valid'
    invalid = 'invalid'
    expired = 'expired'

class DocumentType(str, enum.Enum):
    passport = 'passport'
    bank_statement = 'bank_statement'
    flight_ticket = 'flight_ticket'
    hotel_booking = 'hotel_booking'
    travel_insurance = 'travel_insurance'
    employment_letter = 'employment_letter'
    national_id = 'national_id'
    photograph = 'photograph'
    visa_form = 'visa_form'
    other = 'other'
