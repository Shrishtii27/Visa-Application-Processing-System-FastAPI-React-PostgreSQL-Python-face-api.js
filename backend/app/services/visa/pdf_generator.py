import os
from datetime import date, datetime
from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    PageBreak
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch

class PDFGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.title_style = ParagraphStyle(
            'TitleStyle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#18246f'),
            spaceAfter=20,
            alignment=1 # Center
        )
        self.header_style = ParagraphStyle(
            'HeaderStyle',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#22348f'),
            spaceAfter=15,
            spaceBefore=20
        )
        self.normal_style = self.styles['Normal']
        self.normal_style.fontSize = 11
        self.normal_style.leading = 14

    def generate_application_summary(self, application: dict, output_path: str) -> str:
        doc = SimpleDocTemplate(
            output_path,
            pagesize=A4,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72
        )
        
        elements = []
        
        # Helper to format data
        def get_field(data, key, default="N/A"):
            return str(data.get(key, default) or default)

        passport_data = application.get('passport_mrz_data') or {}
        mrz = passport_data.get('fields') or {}
        form = application.get('form_data') or {}
        
        # PAGE 1 — Application Header
        elements.append(Paragraph("POC Visa Application System", self.title_style))
        elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#ff7a3d'), spaceBefore=5, spaceAfter=20))
        
        elements.append(Paragraph(f"<b>Application ID:</b> {application.get('id')}", self.normal_style))
        elements.append(Paragraph(f"<b>Generated:</b> {datetime.now().strftime('%d %b %Y %H:%M')}", self.normal_style))
        
        status_text = application.get('status', '').upper()
        status_color = colors.green if status_text == 'APPROVED' else (colors.orange if status_text == 'MANUAL_REVIEW' else colors.red)
        elements.append(Paragraph(f"<b>Status:</b> <font color='{status_color}'>{status_text}</font>", self.normal_style))
        
        elements.append(PageBreak())
        
        # PAGE 2 — Applicant Details
        elements.append(Paragraph("Applicant Details", self.header_style))
        
        applicant_data = [
            ["Full Name", f"{get_field(mrz, 'given_names')} {get_field(mrz, 'surname')}".strip()],
            ["Date of Birth", get_field(mrz, 'date_of_birth')],
            ["Nationality", get_field(mrz, 'nationality')],
            ["Passport Number", get_field(mrz, 'passport_number')],
            ["Passport Expiry", get_field(mrz, 'expiry_date')],
            ["Gender", get_field(mrz, 'sex')],
            ["Marital Status", get_field(form, 'marital_status')],
            ["Email", get_field(form, 'email')],
            ["Phone", get_field(form, 'phone_number')],
        ]
        
        t = Table(applicant_data, colWidths=[2*inch, 4*inch])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#f1f5f9')),
            ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor('#334155')),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 10),
            ('TOPPADDING', (0,0), (-1,-1), 10),
            ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#e2e8f0')),
        ]))
        elements.append(t)
        
        elements.append(PageBreak())
        
        # PAGE 3 — Travel Details
        elements.append(Paragraph("Travel Details", self.header_style))
        
        travel_data = [
            ["Destination", get_field(application, 'destination_country_name')],
            ["Visa Type", get_field(application, 'visa_type_name')],
            ["Travel Date", get_field(form, 'intended_travel_date')],
            ["Duration (Days)", get_field(form, 'intended_duration_days')],
            ["Employer", get_field(form, 'employer_name')],
            ["Occupation", get_field(form, 'occupation')],
            ["Monthly Income", f"{get_field(form, 'monthly_income_usd')} USD"],
        ]
        
        t2 = Table(travel_data, colWidths=[2*inch, 4*inch])
        t2.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#f1f5f9')),
            ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor('#334155')),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 10),
            ('TOPPADDING', (0,0), (-1,-1), 10),
            ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#e2e8f0')),
        ]))
        elements.append(t2)
        
        elements.append(PageBreak())
        
        # PAGE 4 — Verification Results
        elements.append(Paragraph("Verification Results", self.header_style))
        
        face_score = get_field(application, 'face_score')
        face_pct = f"{int(float(face_score) * 100)}%" if face_score != 'N/A' else "N/A"
        
        verif_data = [
            ["Passport OCR", "Valid" if application.get('passport_mrz_data') else "Pending"],
            ["Face Verification", f"Score: {face_pct}"],
            ["Application Step", get_field(application, 'step').replace('_', ' ').title()],
        ]
        
        t3 = Table(verif_data, colWidths=[2*inch, 4*inch])
        t3.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#f1f5f9')),
            ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor('#334155')),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 10),
            ('TOPPADDING', (0,0), (-1,-1), 10),
            ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#e2e8f0')),
        ]))
        elements.append(t3)
        
        elements.append(PageBreak())
        
        # PAGE 5 — Embassy Instructions
        elements.append(Paragraph("Embassy Instructions", self.header_style))
        
        elements.append(Paragraph(f"<b>Where to submit:</b> {application.get('embassy_url', 'Check local embassy website')}", self.normal_style))
        elements.append(Spacer(1, 10))
        elements.append(Paragraph(f"<b>Processing time:</b> {application.get('processing_time_days', 15)} working days", self.normal_style))
        elements.append(Spacer(1, 10))
        elements.append(Paragraph(f"<b>Visa fee:</b> {application.get('visa_fee_usd', 0)} USD", self.normal_style))
        elements.append(Spacer(1, 20))
        elements.append(Paragraph("<b>Important notes:</b>", self.normal_style))
        elements.append(Paragraph("Please ensure you carry physical copies of all documents listed in the Document Checklist, along with your original passport and a printed copy of this summary.", self.normal_style))
        
        doc.build(elements)
        return output_path

    def generate_checklist(self, application: dict, checklist: list, output_path: str) -> str:
        doc = SimpleDocTemplate(
            output_path,
            pagesize=A4,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72
        )
        
        elements = []
        
        elements.append(Paragraph("VISA APPLICATION CHECKLIST", self.title_style))
        elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#22348f'), spaceBefore=5, spaceAfter=20))
        
        passport_data = application.get('passport_mrz_data') or {}
        mrz = passport_data.get('fields') or {}
        full_name = f"{mrz.get('given_names', '')} {mrz.get('surname', '')}".strip() or "Unknown"
        
        elements.append(Paragraph(f"<b>Destination:</b> {application.get('destination_country_name', 'Unknown')}", self.normal_style))
        elements.append(Paragraph(f"<b>Visa Type:</b> {application.get('visa_type_name', 'Unknown')}", self.normal_style))
        elements.append(Paragraph(f"<b>Applicant:</b> {full_name}", self.normal_style))
        elements.append(Spacer(1, 30))
        
        completed_count = 0
        total_count = len(checklist)
        
        for item in checklist:
            is_done = item.get('is_completed', False)
            if is_done:
                completed_count += 1
                icon = "Yes"
                color = colors.green
            else:
                icon = "No "
                color = colors.red
            
            elements.append(Paragraph(f"<font color='{color}'>[{icon}]</font> {item.get('name', 'Document')}", self.normal_style))
            elements.append(Spacer(1, 10))
            
        elements.append(Spacer(1, 20))
        elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e2e8f0'), spaceBefore=5, spaceAfter=20))
        
        elements.append(Paragraph(f"<b>{completed_count} of {total_count} documents complete.</b>", self.normal_style))
        
        if completed_count == total_count:
            elements.append(Paragraph("<b><font color='green'>Application ready for submission.</font></b>", self.normal_style))
        else:
            elements.append(Paragraph("<b><font color='red'>Application is incomplete.</font></b>", self.normal_style))
            
        doc.build(elements)
        return output_path

pdf_generator = PDFGenerator()
