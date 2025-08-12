# Overview

This is a T-shirt order management system built for Igreja Evangélica Assembleia de Deus Jerusalém (Jerusalem Evangelical Assembly of God Church). The application provides a comprehensive solution for managing custom T-shirt orders for the church congregation, including order creation, tracking, status management, and PDF report generation.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Template Engine**: Jinja2 with Flask for server-side rendering
- **UI Framework**: Bootstrap 5 for responsive design and component styling
- **JavaScript Libraries**: Chart.js for data visualization, ReportLab for PDF generation
- **Styling**: Custom CSS with church-themed color scheme and branding
- **Icons**: Font Awesome for consistent iconography throughout the interface

## Backend Architecture
- **Web Framework**: Flask (Python) serving as the main application framework
- **Database ORM**: SQLAlchemy with Flask-SQLAlchemy integration for database operations
- **Authentication**: Session-based authentication with Werkzeug password hashing
- **Route Organization**: Modular route structure separated into dedicated routes.py file
- **Application Factory**: Centralized app configuration and initialization in app.py

## Data Storage Solutions
- **Primary Database**: SQLite for development and local deployment
- **Database Schema**: Five main entities - Admin, TShirtOrder, Lot, Size, and Model
- **Data Models**: SQLAlchemy ORM models with proper relationships and constraints
- **Migration Strategy**: Automatic table creation on application startup

## Authentication and Authorization
- **Admin Authentication**: Single-tier admin authentication system
- **Session Management**: Flask sessions for maintaining login state
- **Password Security**: Werkzeug password hashing for secure credential storage
- **Access Control**: Login required decorator for protecting administrative routes

## Core Features
- **Order Management**: Complete CRUD operations for T-shirt orders
- **Status Tracking**: Order status progression (Pending, In Production, Ready, Delivered)
- **Customer Management**: Customer information storage and retrieval
- **Inventory Management**: Lot, size, and model catalog management
- **Reporting**: PDF report generation with detailed order information
- **Dashboard**: Statistical overview with charts and key metrics

# External Dependencies

## Core Framework Dependencies
- **Flask**: Web application framework
- **Flask-SQLAlchemy**: Database ORM integration
- **SQLAlchemy**: Database abstraction layer
- **Werkzeug**: WSGI utilities and security functions

## Frontend Dependencies
- **Bootstrap 5**: CSS framework delivered via CDN
- **Font Awesome**: Icon library delivered via CDN
- **Chart.js**: Data visualization library delivered via CDN

## Report Generation
- **ReportLab**: PDF generation library for creating formatted reports
- **ReportLab components**: SimpleDocTemplate, Table, TableStyle, Paragraph for document structure

## Development Tools
- **Python Logging**: Built-in logging for debugging and monitoring
- **SQLite**: Embedded database for development and testing

## Environment Configuration
- **Environment Variables**: SESSION_SECRET for security configuration
- **Static File Serving**: Flask static file handling for CSS, JS, and assets