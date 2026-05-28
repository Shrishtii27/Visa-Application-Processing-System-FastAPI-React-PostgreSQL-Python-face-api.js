import os
from datetime import datetime
from dateutil.relativedelta import relativedelta
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

def generate_bank_statement():
    output_path = os.path.expanduser("~/Desktop/Perfect_Bank_Statement.pdf")
    
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=72
    )
    
    styles = getSampleStyleSheet()
    elements = []
    
    # Header
    elements.append(Paragraph("<b>GLOBAL BANK INC.</b>", styles["Heading1"]))
    elements.append(Paragraph("OFFICIAL BANK STATEMENT", styles["Heading2"]))
    elements.append(Spacer(1, 20))
    
    # Dates
    today = datetime.now()
    six_months_ago = today - relativedelta(months=6)
    
    elements.append(Paragraph(f"<b>Statement Period:</b> {six_months_ago.strftime('%Y-%m-%d')} to {today.strftime('%Y-%m-%d')}", styles["Normal"]))
    
    # Account Holder
    # Using exact matched name
    elements.append(Paragraph(f"<b>Account Holder:</b> SHRISHTI SRIVASTAVA", styles["Normal"]))
    elements.append(Paragraph(f"<b>Account Number:</b> 1234567890", styles["Normal"]))
    elements.append(Paragraph(f"<b>Currency:</b> USD", styles["Normal"]))
    elements.append(Spacer(1, 20))
    
    # Balances
    elements.append(Paragraph(f"<b>Opening Balance:</b> 2,500.00 USD", styles["Normal"]))
    elements.append(Paragraph(f"<b>Closing Balance:</b> 5,500.00 USD", styles["Normal"]))
    elements.append(Spacer(1, 20))
    
    # Transactions Table (Dummy Data)
    data = [
        ["Date", "Description", "Amount", "Balance"],
        [six_months_ago.strftime('%Y-%m-%d'), "Initial Balance", "", "2,500.00"],
        [(today - relativedelta(months=4)).strftime('%Y-%m-%d'), "Salary Deposit", "+3,000.00", "5,500.00"],
        [today.strftime('%Y-%m-%d'), "Closing Balance", "", "5,500.00"]
    ]
    
    t = Table(data, colWidths=[100, 200, 80, 100])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.grey),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,0), 12),
        ('BACKGROUND', (0,1), (-1,-1), colors.beige),
        ('GRID', (0,0), (-1,-1), 1, colors.black)
    ]))
    
    elements.append(t)
    
    doc.build(elements)
    print(f"Generated at: {output_path}")

if __name__ == "__main__":
    generate_bank_statement()
