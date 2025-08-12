from flask import render_template, request, redirect, url_for, session, flash, make_response
from werkzeug.security import check_password_hash
from app import app, db
from models import Admin, TShirtOrder, Lot, Size, Model
from datetime import datetime
import io
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.units import inch

@app.route('/')
def landing():
    return render_template('landing.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        
        admin = Admin.query.filter_by(email=email).first()
        
        if admin and check_password_hash(admin.password_hash, password):
            session['admin_id'] = admin.id
            session['admin_name'] = admin.name
            flash('Login realizado com sucesso!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Email ou senha incorretos', 'error')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('Logout realizado com sucesso!', 'info')
    return redirect(url_for('landing'))

def login_required(f):
    def decorated_function(*args, **kwargs):
        if 'admin_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

@app.route('/dashboard')
@login_required
def dashboard():
    # Get statistics
    total_orders = TShirtOrder.query.count()
    pending_orders = TShirtOrder.query.filter_by(status='Pendente').count()
    completed_orders = TShirtOrder.query.filter_by(status='Entregue').count()
    total_pieces = db.session.query(db.func.sum(TShirtOrder.quantity)).scalar() or 0
    
    # Recent orders
    recent_orders = TShirtOrder.query.order_by(TShirtOrder.created_at.desc()).limit(10).all()
    
    # Orders by status
    status_counts = db.session.query(
        TShirtOrder.status, 
        db.func.count(TShirtOrder.id)
    ).group_by(TShirtOrder.status).all()
    
    # Orders by size
    size_counts = db.session.query(
        TShirtOrder.size,
        db.func.count(TShirtOrder.id)
    ).group_by(TShirtOrder.size).all()
    
    return render_template('dashboard.html',
                         total_orders=total_orders,
                         pending_orders=pending_orders,
                         completed_orders=completed_orders,
                         total_pieces=total_pieces,
                         recent_orders=recent_orders,
                         status_counts=status_counts,
                         size_counts=size_counts)

@app.route('/orders')
@login_required
def orders():
    # Get filter parameters
    status_filter = request.args.get('status', '')
    size_filter = request.args.get('size', '')
    model_filter = request.args.get('model', '')
    lot_filter = request.args.get('lot', '')
    
    # Build query
    query = TShirtOrder.query
    
    if status_filter:
        query = query.filter(TShirtOrder.status == status_filter)
    if size_filter:
        query = query.filter(TShirtOrder.size == size_filter)
    if model_filter:
        query = query.filter(TShirtOrder.model.like(f'%{model_filter}%'))
    if lot_filter:
        query = query.filter(TShirtOrder.lot_number.like(f'%{lot_filter}%'))
    
    orders = query.order_by(TShirtOrder.created_at.desc()).all()
    
    # Get unique values for filters
    all_statuses = ['Pendente', 'Em Produção', 'Pronto', 'Entregue']
    all_sizes = db.session.query(TShirtOrder.size).distinct().all()
    all_models = db.session.query(TShirtOrder.model).distinct().all()
    all_lots = db.session.query(TShirtOrder.lot_number).distinct().all()
    
    return render_template('orders.html',
                         orders=orders,
                         all_statuses=all_statuses,
                         all_sizes=[s[0] for s in all_sizes],
                         all_models=[m[0] for m in all_models],
                         all_lots=[l[0] for l in all_lots],
                         current_filters={
                             'status': status_filter,
                             'size': size_filter,
                             'model': model_filter,
                             'lot': lot_filter
                         })

@app.route('/new_order', methods=['GET', 'POST'])
@login_required
def new_order():
    if request.method == 'POST':
        quantity = int(request.form.get('quantity', 1))
        
        # Create new order
        order = TShirtOrder(
            congregation_name=request.form['congregation_name'],
            responsible_name=request.form['responsible_name'],
            responsible_phone=request.form.get('responsible_phone'),
            responsible_email=request.form.get('responsible_email'),
            lot_number=request.form['lot_number'],
            model=request.form['model'],
            size=request.form['size'],
            quantity=quantity,
            color=request.form.get('color'),
            observations=request.form.get('observations'),
            delivery_date=datetime.strptime(request.form['delivery_date'], '%Y-%m-%d') if request.form.get('delivery_date') else None,
            status=request.form.get('status', 'Pendente')
        )
        
        db.session.add(order)
        db.session.commit()
        
        flash('Pedido criado com sucesso!', 'success')
        return redirect(url_for('orders'))
    
    # Get existing lots, sizes, and models for dropdowns
    lots = Lot.query.all()
    sizes = Size.query.all()
    models = Model.query.all()
    
    return render_template('new_order.html', lots=lots, sizes=sizes, models=models)

@app.route('/edit_order/<int:order_id>', methods=['GET', 'POST'])
@login_required
def edit_order(order_id):
    order = TShirtOrder.query.get_or_404(order_id)
    
    if request.method == 'POST':
        # Update order
        order.congregation_name = request.form['congregation_name']
        order.responsible_name = request.form['responsible_name']
        order.responsible_phone = request.form.get('responsible_phone')
        order.responsible_email = request.form.get('responsible_email')
        order.lot_number = request.form['lot_number']
        order.model = request.form['model']
        order.size = request.form['size']
        order.quantity = int(request.form.get('quantity', 1))
        order.color = request.form.get('color')
        order.observations = request.form.get('observations')
        order.delivery_date = datetime.strptime(request.form['delivery_date'], '%Y-%m-%d') if request.form.get('delivery_date') else None
        order.status = request.form.get('status', 'Pendente')
        order.updated_at = datetime.utcnow()
        
        db.session.commit()
        flash('Pedido atualizado com sucesso!', 'success')
        return redirect(url_for('orders'))
    
    # Get existing lots, sizes, and models for dropdowns
    lots = Lot.query.all()
    sizes = Size.query.all()
    models = Model.query.all()
    
    return render_template('new_order.html', order=order, lots=lots, sizes=sizes, models=models, editing=True)

@app.route('/delete_order/<int:order_id>')
@login_required
def delete_order(order_id):
    order = TShirtOrder.query.get_or_404(order_id)
    db.session.delete(order)
    db.session.commit()
    flash('Pedido excluído com sucesso!', 'success')
    return redirect(url_for('orders'))

@app.route('/generate_pdf')
@login_required
def generate_pdf():
    # Get all orders
    orders = TShirtOrder.query.order_by(TShirtOrder.created_at.desc()).all()
    
    # Create PDF
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    elements = []
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=16,
        spaceAfter=30,
        alignment=1  # Center alignment
    )
    
    # Title
    title = Paragraph("Igreja Evangélica Assembleia de Deus Jerusalém<br/>Relatório de Pedidos de Camisetas", title_style)
    elements.append(title)
    elements.append(Spacer(1, 20))
    
    # Summary statistics
    total_orders = len(orders)
    total_pieces = sum(order.quantity for order in orders)
    
    summary_data = [
        ['Total de Pedidos:', str(total_orders)],
        ['Total de Peças:', str(total_pieces)],
        ['Data do Relatório:', datetime.now().strftime('%d/%m/%Y %H:%M')]
    ]
    
    summary_table = Table(summary_data, colWidths=[3*inch, 2*inch])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    elements.append(summary_table)
    elements.append(Spacer(1, 30))
    
    # Orders table
    if orders:
        # Table headers
        data = [['Congregação', 'Responsável', 'Lote', 'Modelo', 'Tamanho', 'Qtd', 'Status', 'Data']]
        
        # Table data
        for order in orders:
            data.append([
                order.congregation_name,
                order.responsible_name,
                order.lot_number,
                order.model,
                order.size,
                str(order.quantity),
                order.status,
                order.order_date.strftime('%d/%m/%Y')
            ])
        
        table = Table(data, colWidths=[1.4*inch, 1.2*inch, 0.8*inch, 1*inch, 0.6*inch, 0.5*inch, 0.8*inch, 0.8*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 8),
            ('FONTSIZE', (0, 1), (-1, -1), 7),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        elements.append(table)
    else:
        elements.append(Paragraph("Nenhum pedido encontrado.", styles['Normal']))
    
    # Build PDF
    doc.build(elements)
    
    # Prepare response
    buffer.seek(0)
    response = make_response(buffer.getvalue())
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = f'attachment; filename=relatorio_pedidos_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf'
    
    return response

@app.route('/manage_lots')
@login_required
def manage_lots():
    lots = Lot.query.all()
    return render_template('manage_lots.html', lots=lots)

@app.route('/add_lot', methods=['POST'])
@login_required
def add_lot():
    lot_number = request.form['lot_number']
    description = request.form.get('description', '')
    
    existing_lot = Lot.query.filter_by(lot_number=lot_number).first()
    if existing_lot:
        flash('Lote já existe!', 'error')
    else:
        lot = Lot(lot_number=lot_number, description=description)
        db.session.add(lot)
        db.session.commit()
        flash('Lote adicionado com sucesso!', 'success')
    
    return redirect(url_for('manage_lots'))

@app.route('/add_size', methods=['POST'])
@login_required
def add_size():
    size_name = request.form['size_name']
    description = request.form.get('description', '')
    
    existing_size = Size.query.filter_by(size_name=size_name).first()
    if existing_size:
        flash('Tamanho já existe!', 'error')
    else:
        size = Size(size_name=size_name, description=description)
        db.session.add(size)
        db.session.commit()
        flash('Tamanho adicionado com sucesso!', 'success')
    
    return redirect(url_for('manage_lots'))

@app.route('/add_model', methods=['POST'])
@login_required
def add_model():
    model_name = request.form['model_name']
    description = request.form.get('description', '')
    base_price = float(request.form.get('base_price', 0))
    
    existing_model = Model.query.filter_by(model_name=model_name).first()
    if existing_model:
        flash('Modelo já existe!', 'error')
    else:
        model = Model(model_name=model_name, description=description)
        db.session.add(model)
        db.session.commit()
        flash('Modelo adicionado com sucesso!', 'success')
    
    return redirect(url_for('manage_lots'))
