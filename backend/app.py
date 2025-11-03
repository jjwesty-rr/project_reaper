from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask_bcrypt import Bcrypt
from werkzeug.utils import secure_filename
from datetime import datetime
from functools import wraps
from dotenv import load_dotenv
import os
import json
import openai
import boto3
from botocore.exceptions import ClientError

load_dotenv()
openai.api_key = os.getenv('OPENAI_API_KEY')

# Create Flask app
app = Flask(__name__)

# File upload configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
ALLOWED_EXTENSIONS = {'pdf'}
# S3 Configuration
S3_BUCKET = os.getenv('S3_BUCKET_NAME', 'test-estate-guru-settlement')
S3_REGION = os.getenv('S3_REGION', 'us-east-1')  # Change to your region
AWS_ACCESS_KEY = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')

# Initialize S3 client
s3_client = boto3.client(
    's3',
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY,
    region_name=S3_REGION
)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Create uploads directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Enable CORS so your React app can talk to this Flask backend
CORS(app, 
     supports_credentials=True,
     origins=[
         'https://estate-settlement-frontend.onrender.com',
         'http://localhost:8080',
         'http://127.0.0.1:8080'
     ],
     allow_headers=['Content-Type', 'Authorization'],
     methods=['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'])

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Initialize authentication
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

# Configure SQLite database (we'll use a simple file-based database to start)
# Use PostgreSQL in production, SQLite locally
if os.environ.get('DATABASE_URL'):
    # Render PostgreSQL
    database_url = os.environ.get('DATABASE_URL')
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
else:
    # Local SQLite
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///estate_settlement.db'

# Session configuration for Flask-Login
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SESSION_COOKIE_SECURE'] = True  # HTTPS only
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'None'  # Changed from 'Lax' to 'None' for cross-origin



app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-secret-key-change-this-later'

# Initialize database
db = SQLAlchemy(app)

# ============= DATABASE MODELS =============
# These define what tables and columns your database will have

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    role = db.Column(db.String(20), default='client')  # 'client' or 'admin'
    created_at = db.Column(db.DateTime, default=db.func.now())
    
    submissions = db.relationship('Submission', backref='user', lazy=True)
    
    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def is_admin(self):
        return self.role in ['admin', 'super_admin']  # Both admin and super_admin have admin access
    
    def is_super_admin(self):
        return self.role == 'super_admin'
    

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Helper decorator for admin-only routes
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return jsonify({'error': 'Authentication required'}), 401
        if not current_user.is_admin():
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

# Helper decorator for super-admin-only routes
def super_admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return jsonify({'error': 'Authentication required'}), 401
        if not current_user.is_super_admin():
            return jsonify({'error': 'Super admin access required'}), 403
        return f(*args, **kwargs)
    return decorated_function



class Attorney(db.Model):
    """Attorney profiles"""
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    email = db.Column(db.String(120))
    phone = db.Column(db.String(20))
    state = db.Column(db.String(50))
    specialties = db.Column(db.String(500))  # comma-separated: 'affidavit,informal,formal,trust'
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class StateLimit(db.Model):
    """State estate limit thresholds for determining referral type"""
    id = db.Column(db.Integer, primary_key=True)
    state = db.Column(db.String(50), unique=True, nullable=False)
    limit_amount = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Submission(db.Model):
    """Estate settlement submissions from users"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    
    # Contact Information
    contact_email = db.Column(db.String(120))
    contact_phone = db.Column(db.String(20))
    relationship_to_deceased = db.Column(db.String(100))
    
    # Decedent Information
    decedent_first_name = db.Column(db.String(100))
    decedent_last_name = db.Column(db.String(100))
    decedent_date_of_death = db.Column(db.Date)
    decedent_state = db.Column(db.String(50))
    
    # Estate Information
    estate_value = db.Column(db.Float)
    has_will = db.Column(db.Boolean)
    has_trust = db.Column(db.Boolean)
    has_disputes = db.Column(db.Boolean)
    
   # Document Upload
    trust_document_path = db.Column(db.String(500), nullable=True)
    trust_document_filename = db.Column(db.String(500), nullable=True)

    # Referral Type (determined by logic)
    referral_type = db.Column(db.String(50))  # 'affidavit', 'informal', 'formal', 'trust'
    
    # Status and Assignment
    status = db.Column(db.String(50), default='submitted')
    attorney_id = db.Column(db.Integer, db.ForeignKey('attorney.id'), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    
    # Complete Form Data (JSON)
    form_data = db.Column(db.Text, nullable=True)  # Stores ALL form data as JSON string

    #Doc Summary
    document_summary = db.Column(db.Text, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# ============= HELPER FUNCTIONS =============

def determine_referral_type(estate_value, has_trust, has_disputes, state):
    """
    Logic to determine which type of estate settlement process is needed
    Reads state limits from database
    """
    # If there's a trust, use trust administration
    if has_trust:
        return 'trust'
    
    # If there are disputes, needs formal probate
    if has_disputes:
        return 'formal'
    
    # Check if estate is small enough for affidavit based on state limit from database
    state_limit = StateLimit.query.filter_by(state=state).first()
    limit = state_limit.limit_amount if state_limit else 50000  # default to 50k if state not in database
    
    if estate_value < limit:
        return 'affidavit'
    
    # Otherwise, informal probate
    return 'informal'

# ============= API ROUTES =============

@app.route('/')
def home():
    """Test route to make sure Flask is working"""
    return jsonify({
        'message': 'Estate Settlement API is running!',
        'status': 'success'
    })

@app.route('/api/test', methods=['GET'])
def test():
    """Another test route"""
    return jsonify({'message': 'API is working!', 'timestamp': datetime.utcnow().isoformat()})

@app.route('/api/submissions', methods=['POST'])
def create_submission():
    """Create a new estate settlement submission"""
    try:
        data = request.get_json()
        print("=== Received data ===")
        print(data)
        print("====================")
        
        # Determine the referral type based on the data
        referral_type = determine_referral_type(
            estate_value=data.get('estate_value', 0),
            has_trust=data.get('has_trust', False),
            has_disputes=data.get('has_disputes', False),
            state=data.get('decedent_state', '')
        )
        
        # Create new submission
        submission = Submission(
            user_id=current_user.id if current_user.is_authenticated else None,
            contact_email=data.get('contact_email'),
            contact_phone=data.get('contact_phone'),
            relationship_to_deceased=data.get('relationship_to_deceased'),
            decedent_first_name=data.get('decedent_first_name'),
            decedent_last_name=data.get('decedent_last_name'),
            decedent_date_of_death=datetime.strptime(data.get('decedent_date_of_death'), '%Y-%m-%d') if data.get('decedent_date_of_death') else None,
            decedent_state=data.get('decedent_state'),
            estate_value=data.get('estate_value'),
            has_will=data.get('has_will'),
            has_trust=data.get('has_trust'),
            has_disputes=data.get('has_disputes'),
            referral_type=referral_type,
            form_data=json.dumps(data)  # Store complete form data as JSON string
        )
        
        db.session.add(submission)
        db.session.commit()
        
        return jsonify({
            'message': 'Submission created successfully',
            'submission_id': submission.id,
            'referral_type': referral_type
        }), 201
        
    except Exception as e:
        print("=== ERROR ===")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        import traceback
        traceback.print_exc()
        print("=============")
        return jsonify({'error': str(e)}), 400

@app.route('/api/submissions', methods=['GET'])
@admin_required
def get_submissions():
    """Get all submissions (for admin view)"""
    submissions = Submission.query.all()
    
    result = []
    for sub in submissions:
        result.append({
            'id': sub.id,
            'contact_email': sub.contact_email,
            'decedent_name': f"{sub.decedent_first_name} {sub.decedent_last_name}",
            'decedent_state': sub.decedent_state,
            'estate_value': sub.estate_value,
            'referral_type': sub.referral_type,
            'status': sub.status,
            'attorney_id': sub.attorney_id,
            'notes': sub.notes,
            'has_document': sub.trust_document_path is not None,  
            'document_filename': sub.trust_document_filename,      
            'created_at': sub.created_at.isoformat()
        })
    
    return jsonify(result)


@app.route('/api/my-submissions', methods=['GET'])
@login_required
def get_my_submissions():
    """Get submissions for the current logged-in user"""
    submissions = Submission.query.filter_by(user_id=current_user.id).all()
    
    result = []
    for sub in submissions:
        result.append({
            'id': sub.id,
            'contact_email': sub.contact_email,
            'decedent_name': f"{sub.decedent_first_name} {sub.decedent_last_name}",
            'decedent_state': sub.decedent_state,
            'estate_value': sub.estate_value,
            'referral_type': sub.referral_type,
            'status': sub.status,
            'attorney_id': sub.attorney_id,
            'has_document': sub.trust_document_path is not None,  
            'document_filename': sub.trust_document_filename,
            'created_at': sub.created_at.isoformat(),
            'updated_at': sub.updated_at.isoformat()
        })
    
    return jsonify(result)


@app.route('/api/submissions/<int:submission_id>', methods=['GET'])
def get_submission(submission_id):
    """Get a specific submission by ID"""
    submission = Submission.query.get_or_404(submission_id)
    
    result = {
        'id': submission.id,
        'contact_email': submission.contact_email,
        'contact_phone': submission.contact_phone,
        'relationship_to_deceased': submission.relationship_to_deceased,
        'decedent_first_name': submission.decedent_first_name,
        'decedent_last_name': submission.decedent_last_name,
        'decedent_date_of_death': submission.decedent_date_of_death.isoformat() if submission.decedent_date_of_death else None,
        'decedent_state': submission.decedent_state,
        'estate_value': submission.estate_value,
        'has_will': submission.has_will,
        'has_trust': submission.has_trust,
        'has_disputes': submission.has_disputes,
        'referral_type': submission.referral_type,
        'status': submission.status,
        'has_document': submission.trust_document_path is not None, 
        'document_filename': submission.trust_document_filename, 
        'created_at': submission.created_at.isoformat()
    }
    
    # Include full form data if available
    if submission.form_data:
        result['form_data'] = json.loads(submission.form_data)
    
    return jsonify(result)


@app.route('/api/attorneys', methods=['GET'])
@admin_required
def get_attorneys():
    """Get all attorneys, optionally filtered by specialty and state"""
    specialty = request.args.get('specialty')
    state = request.args.get('state')
    
    query = Attorney.query.filter_by(is_active=True)
    
    if state:
        query = query.filter_by(state=state)
    
    attorneys = query.all()
    
    # Filter by specialty if provided
    if specialty:
        attorneys = [a for a in attorneys if specialty in a.specialties]
    
    result = []
    for attorney in attorneys:
        result.append({
            'id': attorney.id,
            'name': f"{attorney.first_name} {attorney.last_name}",
            'email': attorney.email,
            'phone': attorney.phone,
            'state': attorney.state,
            'specialties': attorney.specialties.split(',') if attorney.specialties else []
        })
    
    return jsonify(result)


@app.route('/api/attorneys', methods=['POST'])
@admin_required
def create_attorney():
    """Create a new attorney (admin only for now)"""
    try:
        data = request.get_json()
        print("Received data:", data)
        
        attorney = Attorney(
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
            email=data.get('email'),
            phone=data.get('phone'),
            state=data.get('state'),
            specialties=','.join(data.get('specialties', []))
        )
        
        db.session.add(attorney)
        db.session.commit()
        
        return jsonify({
            'message': 'Attorney created successfully',
            'attorney_id': attorney.id
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    


@app.route('/api/submissions/<int:submission_id>', methods=['PATCH'])
def update_submission(submission_id):
    """Update a submission (for admin use - assign attorney, update status, add notes)"""
    try:
        submission = Submission.query.get_or_404(submission_id)
        data = request.get_json()
        
        print("=== UPDATE SUBMISSION ===")
        print(f"Submission ID: {submission_id}")
        print(f"Received data keys: {list(data.keys())}")
        print("========================")
        
        # Check if this is a full form update (has form fields) or just admin updates
        is_form_update = 'contact_email' in data or 'decedent_first_name' in data
        
        if is_form_update:
            # Full form update - update all fields and recalculate referral type
            if 'contact_email' in data:
                submission.contact_email = data['contact_email']
            if 'contact_phone' in data:
                submission.contact_phone = data['contact_phone']
            if 'relationship_to_deceased' in data:
                submission.relationship_to_deceased = data['relationship_to_deceased']
            if 'decedent_first_name' in data:
                submission.decedent_first_name = data['decedent_first_name']
            if 'decedent_last_name' in data:
                submission.decedent_last_name = data['decedent_last_name']
            if 'decedent_date_of_death' in data and data['decedent_date_of_death']:
                submission.decedent_date_of_death = datetime.strptime(data['decedent_date_of_death'], '%Y-%m-%d')
            if 'decedent_state' in data:
                submission.decedent_state = data['decedent_state']
            if 'estate_value' in data:
                submission.estate_value = data['estate_value']
            if 'has_will' in data:
                submission.has_will = data['has_will']
            if 'has_trust' in data:
                submission.has_trust = data['has_trust']
            if 'has_disputes' in data:
                submission.has_disputes = data['has_disputes']
            
            # Recalculate referral type
            referral_type = determine_referral_type(
                estate_value=data.get('estate_value', submission.estate_value or 0),
                has_trust=data.get('has_trust', submission.has_trust or False),
                has_disputes=data.get('has_disputes', submission.has_disputes or False),
                state=data.get('decedent_state', submission.decedent_state or '')
            )
            submission.referral_type = referral_type
            
            # Store complete form data
            submission.form_data = json.dumps(data)

        # Admin updates (always allowed)
        if 'status' in data:
            submission.status = data['status']
        
        if 'attorney_id' in data:
            submission.attorney_id = data['attorney_id']
        
        if 'notes' in data:
            submission.notes = data['notes']
        
        # Document updates (ADD THIS SECTION)
        if 'trust_document_path' in data:
            submission.trust_document_path = data['trust_document_path']
        
        if 'trust_document_filename' in data:
            submission.trust_document_filename = data['trust_document_filename']
        
        if 'document_summary' in data:
            submission.document_summary = data['document_summary']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Submission updated successfully',
            'submission_id': submission.id
        }), 200
        
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 400
    


# Register endpoint
@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.json
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 400
        
        # Create new user
        user = User(
            email=data['email'],
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            role=data.get('role', 'client')  # Default to 'client'
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        login_user(user)
        
        return jsonify({
            'message': 'Registration successful',
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Login endpoint
@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        user = User.query.filter_by(email=data['email']).first()
        
        if user and user.check_password(data['password']):
            login_user(user)
            return jsonify({
                'message': 'Login successful',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': user.role
                }
            }), 200
        else:
            return jsonify({'error': 'Invalid email or password'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Logout endpoint
@app.route('/api/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logout successful'}), 200

# Get current user endpoint
@app.route('/api/me', methods=['GET'])
@login_required
def get_current_user():
    return jsonify({
        'id': current_user.id,
        'email': current_user.email,
        'first_name': current_user.first_name,
        'last_name': current_user.last_name,
        'role': current_user.role
    }), 200


@app.route('/api/users/<int:user_id>', methods=['DELETE'])
@login_required
def delete_user(user_id):
    """Delete a user and their submissions (super admin only)"""
    # Only super admins can delete users
    if current_user.role != 'super_admin':
        return jsonify({'error': 'Unauthorized - Super admin access required'}), 403
    
    # Prevent deleting yourself
    if user_id == current_user.id:
        return jsonify({'error': 'Cannot delete your own account'}), 400
    
    try:
        user = User.query.get_or_404(user_id)
        
        # Check if this is the last super admin
        if user.role == 'super_admin':
            super_admin_count = User.query.filter_by(role='super_admin').count()
            if super_admin_count <= 1:
                return jsonify({'error': 'Cannot delete the last super admin'}), 400
        
        # Delete user's submissions first
        Submission.query.filter_by(user_id=user_id).delete()
        
        # Delete the user
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({'message': 'User and their submissions deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    
    
    # Initialize database tables (one-time setup)
@app.route('/api/init-db', methods=['GET'])
def init_db():
    try:
        db.create_all()
        return jsonify({'message': 'Database tables created successfully!'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/migrate-db', methods=['GET'])
def migrate_db():
    """Add missing columns to submission table"""
    try:
        from sqlalchemy import text
        
        # Add trust_document_path column
        try:
            db.session.execute(text(
                "ALTER TABLE submission ADD COLUMN trust_document_path VARCHAR(500)"
            ))
            db.session.commit()
            print("Added trust_document_path column")
        except Exception as e:
            print(f"Column might already exist: {e}")
            db.session.rollback()
        
        # Add trust_document_filename column
        try:
            db.session.execute(text(
                "ALTER TABLE submission ADD COLUMN trust_document_filename VARCHAR(500)"
            ))
            db.session.commit()
            print("Added trust_document_filename column")
        except Exception as e:
            print(f"Column might already exist: {e}")
            db.session.rollback()
        
        return jsonify({'message': 'Database migration completed!'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/add-document-summary-column', methods=['GET'])
def add_document_summary_column():
    """Manually add document_summary column"""
    try:
        # Check if column already exists
        inspector = db.inspect(db.engine)
        columns = [col['name'] for col in inspector.get_columns('submission')]
        
        if 'document_summary' in columns:
            return jsonify({'message': 'Column already exists!'})
        
        # Add the column using raw SQL
        with db.engine.connect() as conn:
            conn.execute(db.text('ALTER TABLE submission ADD COLUMN document_summary TEXT'))
            conn.commit()
        
        return jsonify({'message': 'document_summary column added successfully!'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

      # User Management (Super Admin Only)
@app.route('/api/users', methods=['GET'])
@super_admin_required
def get_users():
    """Get all users for user management (super admin only)"""
    users = User.query.order_by(User.created_at.desc()).all()
    
    result = []
    for user in users:
        result.append({
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
            'created_at': user.created_at.isoformat()
        })
    
    return jsonify(result)


@app.route('/api/users/<int:user_id>', methods=['PATCH'])
@super_admin_required
def update_user_role(user_id):
    """Update a user's role (super admin only)"""
    try:
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        
        # Validate role
        valid_roles = ['client', 'admin', 'super_admin']
        new_role = data.get('role')
        
        if new_role not in valid_roles:
            return jsonify({'error': f'Invalid role. Must be one of: {valid_roles}'}), 400
        
        # Prevent super admin from demoting themselves
        if user_id == current_user.id and new_role != 'super_admin':
            return jsonify({'error': 'Cannot change your own super admin role'}), 403
        
        user.role = new_role
        db.session.commit()
        
        return jsonify({
            'message': 'User role updated successfully',
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500  
    


    # State Limits Management (Admin Only)
@app.route('/api/state-limits', methods=['GET'])
@admin_required
def get_state_limits():
    """Get all state estate limits"""
    limits = StateLimit.query.order_by(StateLimit.state).all()
    
    result = []
    for limit in limits:
        result.append({
            'id': limit.id,
            'state': limit.state,
            'limit_amount': limit.limit_amount,
            'created_at': limit.created_at.isoformat(),
            'updated_at': limit.updated_at.isoformat()
        })
    
    return jsonify(result)


@app.route('/api/state-limits', methods=['POST'])
@admin_required
def create_state_limit():
    """Create a new state limit"""
    try:
        data = request.get_json()
        
        # Check if state already exists
        existing = StateLimit.query.filter_by(state=data['state']).first()
        if existing:
            return jsonify({'error': 'State limit already exists'}), 400
        
        limit = StateLimit(
            state=data['state'],
            limit_amount=data['limit_amount']
        )
        
        db.session.add(limit)
        db.session.commit()
        
        return jsonify({
            'message': 'State limit created successfully',
            'id': limit.id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@app.route('/api/state-limits/<int:limit_id>', methods=['PATCH'])
@admin_required
def update_state_limit(limit_id):
    """Update a state limit"""
    try:
        limit = StateLimit.query.get_or_404(limit_id)
        data = request.get_json()
        
        if 'state' in data:
            # Check if new state name conflicts with existing
            existing = StateLimit.query.filter(
                StateLimit.state == data['state'],
                StateLimit.id != limit_id
            ).first()
            if existing:
                return jsonify({'error': 'State name already exists'}), 400
            limit.state = data['state']
        
        if 'limit_amount' in data:
            limit.limit_amount = data['limit_amount']
        
        db.session.commit()
        
        return jsonify({
            'message': 'State limit updated successfully',
            'id': limit.id
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@app.route('/api/state-limits/<int:limit_id>', methods=['DELETE'])
@admin_required
def delete_state_limit(limit_id):
    """Delete a state limit"""
    try:
        limit = StateLimit.query.get_or_404(limit_id)
        db.session.delete(limit)
        db.session.commit()
        
        return jsonify({'message': 'State limit deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400
    



# ============= FILE UPLOAD/DOWNLOAD ROUTES =============

@app.route('/api/upload-document/<int:submission_id>', methods=['POST'])
@login_required
def upload_document(submission_id):
    """Upload document to S3"""
    submission = Submission.query.get_or_404(submission_id)
    
    # Security check
    if submission.user_id != current_user.id and current_user.role not in ['admin', 'super_admin']:
        return jsonify({'error': 'Unauthorized'}), 403
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'Only PDF files are allowed'}), 400
    
    try:
        # Generate unique filename
        filename = secure_filename(file.filename)
        unique_filename = f"{submission_id}_{datetime.utcnow().timestamp()}_{filename}"
        s3_key = f"documents/{unique_filename}"
        
        # Upload to S3
        s3_client.upload_fileobj(
            file,
            S3_BUCKET,
            s3_key,
            ExtraArgs={
                'ContentType': 'application/pdf',
                'ServerSideEncryption': 'AES256'  # Encrypt at rest
            }
        )
        
        # Update database with S3 path
        submission.trust_document_path = s3_key
        submission.trust_document_filename = filename
        db.session.commit()
        
        return jsonify({
            'message': 'Document uploaded successfully',
            'filename': filename
        })
    
    except ClientError as e:
        print(f"S3 upload error: {e}")
        return jsonify({'error': 'Failed to upload document'}), 500
    except Exception as e:
        print(f"Upload error: {e}")
        return jsonify({'error': 'Failed to upload document'}), 500


@app.route('/api/download-document/<int:submission_id>', methods=['GET'])
@login_required
def download_document(submission_id):
    """Download document from S3"""
    submission = Submission.query.get_or_404(submission_id)
    
    # Security check
    if submission.user_id != current_user.id and current_user.role not in ['admin', 'super_admin']:
        return jsonify({'error': 'Unauthorized'}), 403
    
    if not submission.trust_document_path:
        return jsonify({'error': 'No document found'}), 404
    
    try:
        # Generate presigned URL (valid for 1 hour)
        url = s3_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': S3_BUCKET,
                'Key': submission.trust_document_path
            },
            ExpiresIn=3600  # 1 hour
        )
        
        # Redirect to presigned URL
        from flask import redirect
        return redirect(url)
    
    except ClientError as e:
        print(f"S3 download error: {e}")
        return jsonify({'error': 'Failed to download document'}), 500



@app.route('/api/submissions/<int:id>/summarize-document', methods=['POST'])
@login_required
def summarize_document(id):
    """Generate AI summary of uploaded document"""
    import pdfplumber
    import io
    from openai import OpenAI
    
    submission = Submission.query.get_or_404(id)
    
    # Security: users can only summarize their own documents, admins can summarize any
    if submission.user_id != current_user.id and current_user.role not in ['admin', 'super_admin']:
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Check if document exists
    if not submission.trust_document_path:
        return jsonify({'error': 'No document uploaded'}), 404
    
    try:
        # Download file from S3 to memory
        s3_object = s3_client.get_object(
            Bucket=S3_BUCKET,
            Key=submission.trust_document_path
        )
        
        pdf_bytes = s3_object['Body'].read()
        pdf_file = io.BytesIO(pdf_bytes)
        
        # Extract text from PDF
        text = ""
        with pdfplumber.open(pdf_file) as pdf:
            for page in pdf.pages[:15]:  # Limit to first 15 pages
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        
        if not text.strip():
            return jsonify({'error': 'Could not extract text from document'}), 400
        
        # Truncate to fit token limits (roughly 8000 characters = 2500 tokens)
        text = text[:8000]
        
        prompt = f"""Analyze this estate planning document and provide a comprehensive summary.

Document text:
{text}

Provide a structured summary with:
1. **Document Type**: Identify if this is a Trust, Will, Codicil, etc.
2. **Key Parties**: 
   - Trustor/Testator (person who created the document)
   - Trustees/Executors (who manages the estate)
   - Beneficiaries (who receives assets)
3. **Major Assets or Property**: List any significant assets, property, or accounts mentioned
4. **Important Provisions**: Key instructions, conditions, or special arrangements
5. **Distribution Plan**: How assets are to be distributed
6. **Red Flags or Concerns**: Any potential issues, conflicts, unclear language, or items requiring attorney attention

Format your response clearly with headers and bullet points where appropriate."""

        # Use new OpenAI client syntax
        client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert estate planning document analyst. Provide clear, professional summaries that help attorneys and clients understand key document details."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=1000
        )
        
        summary = response.choices[0].message.content
        
        # Save summary to database
        submission.document_summary = summary
        db.session.commit()
        
        return jsonify({
            'summary': summary,
            'success': True
        })
    
    except Exception as e:
        print(f"Error summarizing document: {e}")
        return jsonify({'error': f'Failed to summarize document: {str(e)}'}), 500

# ============= RUN THE APP =============
if __name__ == '__main__':
    # Create database tables if they don't exist
    with app.app_context():
        db.create_all()
        print("Database tables created!")
    
    # Run the Flask development server
    app.run(debug=True, port=5000)

