from flask import Flask
from extensions import db, bcrypt, jwt, cors, migrate
import os

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'your_secret_key_here'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ecotrack.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = 'jwt_secret_key_here'

    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    cors.init_app(app)
    migrate.init_app(app, db)

    from routes.auth import auth_bp
    from routes.emissions import emissions_bp
    from routes.analytics import analytics_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(emissions_bp, url_prefix='/api/emissions')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')

    @app.route('/')
    def index():
        return {"message": "Eco-Track AI API is running"}

    @app.route('/api/sync', methods=['POST'])
    @app.route('/sync', methods=['POST'])
    @app.route('/api/records', methods=['POST'])  # Added to match NEON-AI sync
    def global_sync():
        from routes.emissions import add_emission
        return add_emission()

    @app.route('/api/records', methods=['GET'])
    @app.route('/api/history', methods=['GET'])
    def global_records():
        from routes.emissions import get_history
        return get_history()

    @app.route('/api/dashboard', methods=['GET'])
    def global_dashboard():
        from routes.emissions import get_dashboard
        return get_dashboard()

    # Redundant if blueprint handles it, but good for explicit routing
    @app.route('/api/analytics', methods=['GET'])
    def global_analytics():
        from routes.analytics import get_analytics
        return get_analytics()

    return app

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
