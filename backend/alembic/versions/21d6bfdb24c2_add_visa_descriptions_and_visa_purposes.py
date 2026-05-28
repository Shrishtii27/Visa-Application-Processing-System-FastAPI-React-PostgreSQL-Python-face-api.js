"""add visa descriptions and visa purposes

Revision ID: 21d6bfdb24c2
Revises: 84d2af6f4e72
Create Date: 2026-05-26 15:31:52.437407

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '21d6bfdb24c2'
down_revision: Union[str, Sequence[str], None] = '84d2af6f4e72'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Disable transaction to allow ALTER TYPE
    op.execute("COMMIT")
    
    # Add new Enum values safely
    new_purposes = [
        'work', 'medical', 'spouse_dependent', 'immigrant_pr', 
        'diplomatic', 'working_holiday', 'journalist', 'religious'
    ]
    for purpose in new_purposes:
        op.execute(f"ALTER TYPE visa_purpose ADD VALUE IF NOT EXISTS '{purpose}'")
        
    # Start transaction again
    op.execute("BEGIN")
    
    # Add description column
    op.add_column('visa_types', sa.Column('description', sa.Text(), nullable=True))
    
    # Add constraint
    op.create_check_constraint(
        'ck_visa_description_length',
        'visa_types',
        'length(description) <= 2000'
    )
    
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # Drop constraint
    op.drop_constraint('ck_visa_description_length', 'visa_types', type_='check')
    
    # Drop column
    op.drop_column('visa_types', 'description')
    # ### end Alembic commands ###
