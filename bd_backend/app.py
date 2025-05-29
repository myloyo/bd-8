from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt
from dotenv import load_dotenv
import os
from models import db, Dish, OrderOfDishes, Country, Season, Chief, DishType, Human, DishRating, Product, Recipe
from services.dish_service import calculate_dish_cost, get_seasonal_dishes, change_dish_chef
from services.rating_service import update_dish_rating, get_dish_ratings
from services.order_service import create_order
from flasgger import Swagger
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

load_dotenv()

app = Flask(__name__)
CORS(app)
Swagger(app, template={
    "securityDefinitions": {
        "Bearer": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header",
            "description": "JWT Authorization header using the Bearer scheme. Example: 'Authorization: Bearer {token}'"
        }
    }
})

# Конфигурация БД
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('SECRET_KEY', 'super-secret-key')
jwt = JWTManager(app)

db.init_app(app)

def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        if not claims.get('is_admin'):
            return jsonify(msg="Требуются права администратора"), 403
        return fn(*args, **kwargs)
    return wrapper

# Регистрация API
@app.route('/api/dishes', methods=['GET'])
def get_dishes():
    """
    Получить список всех блюд
    ---
    responses:
      200:
        description: Список блюд
        schema:
          type: array
          items:
            type: object
            properties:
              id_dish:
                type: integer
              name_dish:
                type: string
    """
    dishes = Dish.query.all()
    return jsonify([{
        'id_dish': d.id_dish,
        'name_dish': d.name_dish,
        'id_season': d.id_season,
        'id_country': d.id_country,
        'id_group': d.id_group,
        'id_chief': d.id_chief
    } for d in dishes])

@app.route('/api/dishes/<int:id>', methods=['GET'])
def get_dish(id):
    """
    Получить информацию о конкретном блюде по id
    ---
    parameters:
      - name: id
        in: path
        type: integer
        required: true
        description: ID блюда
    responses:
      200:
        description: Информация о блюде
        schema:
          type: object
          properties:
            id_dish:
              type: integer
            name_dish:
              type: string
            id_season:
              type: integer
            id_country:
              type: integer
            id_group:
              type: integer
            id_chief:
              type: integer
      404:
        description: Блюдо не найдено
        schema:
          type: object
          properties:
            error:
              type: string
    """
    dish = Dish.query.get(id)
    if dish:
        return jsonify({
            'id_dish': dish.id_dish,
            'name_dish': dish.name_dish,
            'id_season': dish.id_season,
            'id_country': dish.id_country,
            'id_group': dish.id_group,
            'id_chief': dish.id_chief
        })
    return jsonify({'error': 'Dish not found'}), 404

@app.route('/api/dishes', methods=['POST'])
@jwt_required()
def create_dish():
    """
    Создать новое блюдо
    ---
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - name_dish
            - id_season
            - id_country
            - id_group
            - id_chief
          properties:
            name_dish:
              type: string
            id_season:
              type: integer
            id_country:
              type: integer
            id_group:
              type: integer
            id_chief:
              type: integer
    responses:
      201:
        description: Блюдо создано
        schema:
          type: object
          properties:
            message:
              type: string
            id:
              type: integer
    """
    data = request.json
    new_dish = Dish(
        name_dish=data['name_dish'],
        id_season=data['id_season'],
        id_country=data['id_country'],
        id_group=data['id_group'],
        id_chief=data['id_chief']
    )
    db.session.add(new_dish)
    db.session.commit()
    return jsonify({'message': 'Dish created', 'id': new_dish.id_dish}), 201

@app.route('/api/dishes/<int:id>', methods=['PUT'])
@admin_required
def update_dish(id):
    """
    Обновить блюдо по id (только для администратора)
    ---
    tags:
      - Блюда
    security:
      - Bearer: []
    parameters:
      - in: header
        name: Authorization
        required: true
        type: string
        description: 'Bearer <ваш_токен_авторизации>'
        example: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'
      - name: id
        in: path
        type: integer
        required: true
        description: ID блюда
        example: 1
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            name_dish:
              type: string
              example: "Пицца Маргарита"
            id_season:
              type: integer
              example: 5
            id_country:
              type: integer
              example: 3
            id_group:
              type: integer
              example: 11
            id_chief:
              type: integer
              example: 10
    responses:
      200:
        description: Блюдо обновлено
        schema:
          type: object
          properties:
            message:
              type: string
      404:
        description: Блюдо не найдено
        schema:
          type: object
          properties:
            message:
              type: string
    """
    dish = Dish.query.get(id)
    if not dish:
        return jsonify({'message': 'Блюдо не найдено'}), 404
    data = request.json
    for key in ['name_dish', 'id_season', 'id_country', 'id_group', 'id_chief']:
        if key in data:
            setattr(dish, key, data[key])
    db.session.commit()
    return jsonify({'message': 'Блюдо обновлено'})

@app.route('/api/dishes/<int:id>', methods=['DELETE'])
@admin_required
def delete_dish(id):
    """
    Удалить блюдо по id (только для администратора)
    ---
    tags:
      - Блюда
    security:
      - Bearer: []
    parameters:
      - in: header
        name: Authorization
        required: true
        type: string
        description: 'Bearer <ваш_токен_авторизации>'
        example: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'
      - name: id
        in: path
        type: integer
        required: true
        description: ID блюда
        example: 1
    responses:
      200:
        description: Блюдо удалено
        schema:
          type: object
          properties:
            message:
              type: string
      404:
        description: Блюдо не найдено
        schema:
          type: object
          properties:
            message:
              type: string
    """
    dish = Dish.query.get(id)
    if not dish:
        return jsonify({'message': 'Блюдо не найдено'}), 404
    db.session.delete(dish)
    db.session.commit()
    return jsonify({'message': 'Блюдо удалено'})

# Эндпоинты для хранимых процедур
@app.route('/api/dishes/<int:id>/cost', methods=['GET'])
def get_dish_cost(id):
    """
    Получить стоимость блюда по id
    ---
    parameters:
      - name: id
        in: path
        type: integer
        required: true
        description: ID блюда
    responses:
      200:
        description: Стоимость блюда
        schema:
          type: object
          properties:
            cost:
              type: number
    """
    cost = calculate_dish_cost(id)
    return jsonify({'cost': cost})

@app.route('/api/dishes/seasonal/<season>', methods=['GET'])
def get_seasonal_dishes_endpoint(season):
    """
    Получить блюда по сезону
    ---
    parameters:
      - name: season
        in: path
        type: string
        required: true
        description: Название сезона (например, 'Лето')
    responses:
      200:
        description: Список блюд по сезону
        schema:
          type: array
          items:
            type: object
    """
    dishes = get_seasonal_dishes(season)
    return jsonify([d.serialize() for d in dishes])

@app.route('/api/ratings', methods=['POST'])
@jwt_required()
def add_rating():
    """
    Добавить или обновить рейтинг блюда
    ---
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - user_id
            - dish_id
            - rate
          properties:
            user_id:
              type: integer
            dish_id:
              type: integer
            rate:
              type: integer
            comment:
              type: string
            id_rate:
              type: integer
    responses:
      201:
        description: Рейтинг успешно добавлен/обновлён
        schema:
          type: object
      400:
        description: Ошибка при добавлении рейтинга
        schema:
          type: object
    """
    data = request.json
    result = update_dish_rating(
        data['user_id'],
        data['dish_id'],
        data['rate'],
        data.get('comment'),
        data.get('id_rate')
    )
    if result['success']:
        return jsonify(result), 201
    return jsonify(result), 400

@app.route('/api/dishes/<int:dish_id>/change_chef', methods=['POST'])
@jwt_required()
def change_chef(dish_id):
    """
    Сменить шефа у блюда
    ---
    security:
      - Bearer: []
    parameters:
      - name: dish_id
        in: path
        type: integer
        required: true
        description: ID блюда
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - new_chef_id
          properties:
            new_chef_id:
              type: integer
    responses:
      200:
        description: Шеф успешно изменён
        schema:
          type: object
      400:
        description: Ошибка при смене шефа
        schema:
          type: object
    """
    data = request.json
    result = change_dish_chef(dish_id, data['new_chef_id'])
    if result['success']:
        return jsonify(result), 200
    return jsonify(result), 400

@app.route('/api/orders', methods=['POST'])
@jwt_required()
def add_order():
    """
    Создать заказ блюда пользователем
    ---
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - id_dish
            - id_user
          properties:
            id_dish:
              type: integer
            id_user:
              type: integer
    responses:
      201:
        description: Заказ успешно создан
        schema:
          type: object
      400:
        description: Ошибка при создании заказа
        schema:
          type: object
    """
    data = request.json
    result = create_order(data['id_dish'], data['id_user'])
    if result['success']:
        return jsonify(result), 201
    return jsonify(result), 400

@app.route('/api/login', methods=['POST'])
def login():
    """
    Авторизация пользователя
    ---
    tags:
      - Авторизация
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - email
            - password
          properties:
            email:
              type: string
              example: "user1@mail.ru"
            password:
              type: string
              example: "password"
    responses:
      200:
        description: JWT токен и признак администратора
        schema:
          type: object
          properties:
            access_token:
              type: string
            is_admin:
              type: boolean
    """
    data = request.json
    user = Human.query.filter_by(email=data['email']).first()
    if user and check_password_hash(user.password_hash, data['password']):
        access_token = create_access_token(identity=user.id_user, additional_claims={"is_admin": user.is_admin})
        return jsonify(access_token=access_token, is_admin=user.is_admin)
    return jsonify(msg="Неверные данные"), 401

@app.route('/api/countries', methods=['GET'])
@jwt_required()
def get_countries():
    """
    Получить список стран
    ---
    tags:
      - Справочники
    security:
      - Bearer: []
    parameters:
      - in: header
        name: Authorization
        required: true
        type: string
        description: 'Bearer <ваш_токен_авторизации> (получить через /api/login)'
        example: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'
    responses:
      200:
        description: Список стран
        schema:
          type: array
          items:
            type: object
            properties:
              id_country:
                type: integer
              name_country:
                type: string
    """
    countries = Country.query.all()
    return jsonify([{'id_country': c.id_country, 'name_country': c.name_country} for c in countries])

@app.route('/api/countries', methods=['POST'])
@admin_required
def create_country():
    """
    Добавить страну (только для администратора)
    ---
    tags:
      - Справочники
    security:
      - Bearer: []
    parameters:
      - in: header
        name: Authorization
        required: true
        type: string
        description: 'Bearer <ваш_токен_авторизации> (получить через /api/login)'
        example: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - name_country
          properties:
            name_country:
              type: string
              example: "Россия"
    responses:
      201:
        description: Страна добавлена
        schema:
          type: object
          properties:
            id_country:
              type: integer
            name_country:
              type: string
    """
    data = request.json
    country = Country(name_country=data['name_country'])
    db.session.add(country)
    db.session.commit()
    return jsonify({'id_country': country.id_country, 'name_country': country.name_country}), 201

@app.route('/api/countries/<int:id_country>', methods=['DELETE'])
@admin_required
def delete_country(id_country):
    """
    Удалить страну (только для администратора)
    ---
    tags:
      - Справочники
    security:
      - Bearer: []
    parameters:
      - in: header
        name: Authorization
        required: true
        type: string
        description: 'Bearer <ваш_токен_авторизации> (получить через /api/login)'
        example: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'
      - name: id_country
        in: path
        type: integer
        required: true
        description: ID страны (например, 1)
        example: 1
    responses:
      200:
        description: Страна удалена
        schema:
          type: object
          properties:
            message:
              type: string
    """
    country = Country.query.get(id_country)
    if not country:
        return jsonify({'message': 'Страна не найдена'}), 404
    db.session.delete(country)
    db.session.commit()
    return jsonify({'message': 'Страна удалена'})

@app.route('/api/female_users', methods=['POST'])
@admin_required
def add_female_user():
    """
    Добавить пользователя-женщину через представление female_users_view
    ---
    tags:
      - Действия
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - id_user
            - name_user
            - email
            - age
            - id_country
            - sex
          properties:
            id_user:
              type: integer
              example: 101
            name_user:
              type: string
              example: "Анна"
            email:
              type: string
              example: "anna@mail.ru"
            age:
              type: string
              example: "2000-01-01"
            id_country:
              type: integer
              example: 1
            sex:
              type: string
              example: "female"
    responses:
      201:
        description: Пользователь добавлен
        schema:
          type: object
          properties:
            message:
              type: string
      400:
        description: Ошибка
        schema:
          type: object
          properties:
            message:
              type: string
    """
    data = request.json
    try:
        db.session.execute(
            "INSERT INTO female_users_view (id_user, name_user, email, age, id_country, sex) VALUES (:id_user, :name_user, :email, :age, :id_country, :sex)",
            data
        )
        db.session.commit()
        return jsonify({'message': 'Пользователь добавлен'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 400

@app.route('/api/dishes/search', methods=['GET'])
@jwt_required()
def search_dishes():
    """
    Поиск блюд по стране, сезону, типу
    ---
    tags:
      - Действия
    parameters:
      - name: country_id
        in: query
        type: integer
        required: false
        description: ID страны
      - name: season_id
        in: query
        type: integer
        required: false
        description: ID сезона
      - name: group_id
        in: query
        type: integer
        required: false
        description: ID типа блюда
    responses:
      200:
        description: Список найденных блюд
        schema:
          type: array
          items:
            type: object
            properties:
              id_dish:
                type: integer
              name_dish:
                type: string
    """
    query = Dish.query
    country_id = request.args.get('country_id', type=int)
    season_id = request.args.get('season_id', type=int)
    group_id = request.args.get('group_id', type=int)
    if country_id:
        query = query.filter_by(id_country=country_id)
    if season_id:
        query = query.filter_by(id_season=season_id)
    if group_id:
        query = query.filter_by(id_group=group_id)
    dishes = query.all()
    return jsonify([{'id_dish': d.id_dish, 'name_dish': d.name_dish} for d in dishes])

@app.route('/api/reports/dish_ratings', methods=['GET'])
@jwt_required()
def report_dish_ratings():
    """
    Отчёт: рейтинг блюд с комментариями
    ---
    tags:
      - Отчёты
    parameters:
      - name: min_rating
        in: query
        type: integer
        required: false
        description: Минимальный рейтинг (по умолчанию 3)
        default: 3
    responses:
      200:
        description: Список блюд с рейтингом
        schema:
          type: array
          items:
            type: object
            properties:
              dish_id:
                type: integer
              dish_name:
                type: string
              avg_rating:
                type: number
              comments:
                type: string
    """
    min_rating = request.args.get('min_rating', 3, type=int)
    result = get_dish_ratings(min_rating)
    return jsonify(result)

@app.route('/api/register', methods=['POST'])
def register():
    """
    Регистрация пользователя (админ или обычный)
    ---
    tags:
      - Авторизация
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - email
            - password
            - name_user
            - is_admin
          properties:
            email:
              type: string
              example: "admin@mail.ru"
            password:
              type: string
              example: "adminpass"
            name_user:
              type: string
              example: "Админ"
            is_admin:
              type: boolean
              example: true
    responses:
      201:
        description: Пользователь зарегистрирован
        schema:
          type: object
          properties:
            message:
              type: string
      400:
        description: Ошибка регистрации
        schema:
          type: object
          properties:
            message:
              type: string
    """
    data = request.json
    if Human.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Пользователь с таким email уже существует'}), 400
    user = Human(
        email=data['email'],
        name_user=data['name_user'],
        password_hash=generate_password_hash(data['password']),
        is_admin=data.get('is_admin', False)
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'Пользователь зарегистрирован'}), 201

@app.route('/api/orders', methods=['GET'])
@admin_required
def get_orders():
    """
    Получить список всех заказов (только для администратора)
    ---
    tags:
      - Заказы
    security:
      - Bearer: []
    parameters:
      - in: header
        name: Authorization
        required: true
        type: string
        description: 'Bearer <ваш_токен_авторизации>'
        example: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'
    responses:
      200:
        description: Список заказов
        schema:
          type: array
          items:
            type: object
            properties:
              id_order:
                type: integer
              id_dish:
                type: integer
              id_user:
                type: integer
              date:
                type: string
    """
    orders = OrderOfDishes.query.all()
    return jsonify([
        {'id_order': o.id_order, 'id_dish': o.id_dish, 'id_user': o.id_user, 'date': o.date.isoformat() if o.date else None}
        for o in orders
    ])

@app.route('/api/ratings', methods=['GET'])
@admin_required
def get_ratings():
    """
    Получить список всех рейтингов (только для администратора)
    ---
    tags:
      - Рейтинги
    security:
      - Bearer: []
    parameters:
      - in: header
        name: Authorization
        required: true
        type: string
        description: 'Bearer <ваш_токен_авторизации>'
        example: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'
    responses:
      200:
        description: Список рейтингов
        schema:
          type: array
          items:
            type: object
            properties:
              id_rate:
                type: integer
              id_user:
                type: integer
              id_dish:
                type: integer
              rate:
                type: integer
              comment:
                type: string
              date:
                type: string
    """
    ratings = DishRating.query.all()
    return jsonify([
        {'id_rate': r.id_rate, 'id_user': r.id_user, 'id_dish': r.id_dish, 'rate': r.rate, 'comment': r.comment, 'date': r.date.isoformat() if r.date else None}
        for r in ratings
    ])

@app.route('/api/seasons', methods=['GET'])
def get_seasons():
    """
    Получить список сезонов
    ---
    tags:
      - Справочники
    responses:
      200:
        description: Список сезонов
        schema:
          type: array
          items:
            type: object
            properties:
              id_season:
                type: integer
              name_season:
                type: string
    """
    seasons = Season.query.all()
    return jsonify([{'id_season': s.id_season, 'name_season': s.name_season} for s in seasons])

@app.route('/api/dishtypes', methods=['GET'])
def get_dishtypes():
    """
    Получить список типов блюд
    ---
    tags:
      - Справочники
    responses:
      200:
        description: Список типов блюд
        schema:
          type: array
          items:
            type: object
            properties:
              id_group:
                type: integer
              type:
                type: string
    """
    types = DishType.query.all()
    return jsonify([{'id_group': t.id_group, 'type': t.type} for t in types])

@app.route('/api/chiefs', methods=['GET'])
def get_chiefs():
    """
    Получить список шефов
    ---
    tags:
      - Справочники
    responses:
      200:
        description: Список шефов
        schema:
          type: array
          items:
            type: object
            properties:
              id_chief:
                type: integer
              name_chief:
                type: string
              id_country:
                type: integer
              exp_years:
                type: integer
    """
    chiefs = Chief.query.all()
    return jsonify([
        {'id_chief': c.id_chief, 'name_chief': c.name_chief, 'id_country': c.id_country, 'exp_years': c.exp_years}
        for c in chiefs
    ])

@app.route('/api/users', methods=['GET'])
@admin_required
def get_users():
    """
    Получить список всех пользователей (только для администратора)
    ---
    tags:
      - Пользователи
    security:
      - Bearer: []
    parameters:
      - in: header
        name: Authorization
        required: true
        type: string
        description: 'Bearer <ваш_токен_авторизации>'
        example: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'
    responses:
      200:
        description: Список пользователей
        schema:
          type: array
          items:
            type: object
            properties:
              id_user:
                type: integer
              name_user:
                type: string
              email:
                type: string
              age:
                type: string
              id_country:
                type: integer
              sex:
                type: string
              is_admin:
                type: boolean
    """
    users = Human.query.all()
    return jsonify([
        {'id_user': u.id_user, 'name_user': u.name_user, 'email': u.email, 'age': u.age.isoformat() if u.age else None, 'id_country': u.id_country, 'sex': u.sex, 'is_admin': u.is_admin}
        for u in users
    ])

@app.route('/api/products', methods=['GET'])
def get_products():
    """
    Получить список продуктов
    ---
    tags:
      - Справочники
    responses:
      200:
        description: Список продуктов
        schema:
          type: array
          items:
            type: object
            properties:
              id_prod:
                type: integer
              name_product:
                type: string
              calories:
                type: integer
              cost_product:
                type: integer
              id_season:
                type: integer
    """
    products = Product.query.all()
    return jsonify([
        {'id_prod': p.id_prod, 'name_product': p.name_product, 'calories': p.calories, 'cost_product': p.cost_product, 'id_season': p.id_season}
        for p in products
    ])

@app.route('/api/recipes', methods=['GET'])
def get_recipes():
    """
    Получить список рецептов
    ---
    tags:
      - Справочники
    responses:
      200:
        description: Список рецептов
        schema:
          type: array
          items:
            type: object
            properties:
              id_dish:
                type: integer
              id_product:
                type: integer
              gramms:
                type: integer
    """
    recipes = Recipe.query.all()
    return jsonify([
        {'id_dish': r.id_dish, 'id_product': r.id_product, 'gramms': r.gramms}
        for r in recipes
    ])

@app.route('/api/products', methods=['POST'])
@admin_required
def create_product():
    """
    Добавить продукт (только для администратора)
    ---
    tags:
      - Продукты
    security:
      - Bearer: []
    parameters:
      - in: header
        name: Authorization
        required: true
        type: string
        description: 'Bearer <ваш_токен_авторизации>'
        example: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - name_product
            - calories
            - cost_product
            - id_season
          properties:
            name_product:
              type: string
              example: "Томат"
            calories:
              type: integer
              example: 18
            cost_product:
              type: integer
              example: 5
            id_season:
              type: integer
              example: 2
    responses:
      201:
        description: Продукт добавлен
        schema:
          type: object
          properties:
            id_prod:
              type: integer
            name_product:
              type: string
    """
    data = request.json
    product = Product(
        name_product=data['name_product'],
        calories=data['calories'],
        cost_product=data['cost_product'],
        id_season=data.get('id_season')
    )
    db.session.add(product)
    db.session.commit()
    return jsonify({'id_prod': product.id_prod, 'name_product': product.name_product}), 201

@app.route('/api/products/<int:id_prod>', methods=['GET'])
def get_product(id_prod):
    """
    Получить продукт по id
    ---
    tags:
      - Продукты
    parameters:
      - name: id_prod
        in: path
        type: integer
        required: true
        description: ID продукта
        example: 1
    responses:
      200:
        description: Продукт
        schema:
          type: object
          properties:
            id_prod:
              type: integer
            name_product:
              type: string
            calories:
              type: integer
            cost_product:
              type: integer
            id_season:
              type: integer
      404:
        description: Продукт не найден
        schema:
          type: object
          properties:
            message:
              type: string
    """
    product = Product.query.get(id_prod)
    if not product:
        return jsonify({'message': 'Продукт не найден'}), 404
    return jsonify({
        'id_prod': product.id_prod,
        'name_product': product.name_product,
        'calories': product.calories,
        'cost_product': product.cost_product,
        'id_season': product.id_season
    })

@app.route('/api/products/<int:id_prod>', methods=['PUT'])
@admin_required
def update_product(id_prod):
    """
    Обновить продукт по id (только для администратора)
    ---
    tags:
      - Продукты
    security:
      - Bearer: []
    parameters:
      - in: header
        name: Authorization
        required: true
        type: string
        description: 'Bearer <ваш_токен_авторизации>'
        example: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'
      - name: id_prod
        in: path
        type: integer
        required: true
        description: ID продукта
        example: 1
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            name_product:
              type: string
              example: "Томат"
            calories:
              type: integer
              example: 18
            cost_product:
              type: integer
              example: 5
            id_season:
              type: integer
              example: 2
    responses:
      200:
        description: Продукт обновлён
        schema:
          type: object
          properties:
            message:
              type: string
      404:
        description: Продукт не найден
        schema:
          type: object
          properties:
            message:
              type: string
    """
    product = Product.query.get(id_prod)
    if not product:
        return jsonify({'message': 'Продукт не найден'}), 404
    data = request.json
    for key in ['name_product', 'calories', 'cost_product', 'id_season']:
        if key in data:
            setattr(product, key, data[key])
    db.session.commit()
    return jsonify({'message': 'Продукт обновлён'})

@app.route('/api/products/<int:id_prod>', methods=['DELETE'])
@admin_required
def delete_product(id_prod):
    """
    Удалить продукт по id (только для администратора)
    ---
    tags:
      - Продукты
    security:
      - Bearer: []
    parameters:
      - in: header
        name: Authorization
        required: true
        type: string
        description: 'Bearer <ваш_токен_авторизации>'
        example: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'
      - name: id_prod
        in: path
        type: integer
        required: true
        description: ID продукта
        example: 1
    responses:
      200:
        description: Продукт удалён
        schema:
          type: object
          properties:
            message:
              type: string
      404:
        description: Продукт не найден
        schema:
          type: object
          properties:
            message:
              type: string
    """
    product = Product.query.get(id_prod)
    if not product:
        return jsonify({'message': 'Продукт не найден'}), 404
    db.session.delete(product)
    db.session.commit()
    return jsonify({'message': 'Продукт удалён'})

@app.route('/api/dishtypes', methods=['POST'])
@admin_required
def create_dishtype():
    """
    Добавить тип блюда (только для администратора)
    ---
    tags:
      - Типы блюд
    security:
      - Bearer: []
    parameters:
      - in: header
        name: Authorization
        required: true
        type: string
        description: 'Bearer <ваш_токен_авторизации>'
        example: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - type
          properties:
            type:
              type: string
              example: "завтрак"
    responses:
      201:
        description: Тип блюда добавлен
        schema:
          type: object
          properties:
            id_group:
              type: integer
            type:
              type: string
    """
    data = request.json
    dishtype = DishType(type=data['type'])
    db.session.add(dishtype)
    db.session.commit()
    return jsonify({'id_group': dishtype.id_group, 'type': dishtype.type}), 201

@app.route('/api/dishtypes/<int:id_group>', methods=['GET'])
def get_dishtype(id_group):
    """
    Получить тип блюда по id
    ---
    tags:
      - Типы блюд
    parameters:
      - name: id_group
        in: path
        type: integer
        required: true
        description: ID типа блюда
        example: 1
    responses:
      200:
        description: Тип блюда
        schema:
          type: object
          properties:
            id_group:
              type: integer
            type:
              type: string
      404:
        description: Тип блюда не найден
        schema:
          type: object
          properties:
            message:
              type: string
    """
    dishtype = DishType.query.get(id_group)
    if not dishtype:
        return jsonify({'message': 'Тип блюда не найден'}), 404
    return jsonify({'id_group': dishtype.id_group, 'type': dishtype.type})

@app.route('/api/dishtypes/<int:id_group>', methods=['PUT'])
@admin_required
def update_dishtype(id_group):
    """
    Обновить тип блюда по id (только для администратора)
    ---
    tags:
      - Типы блюд
    security:
      - Bearer: []
    parameters:
      - in: header
        name: Authorization
        required: true
        type: string
        description: 'Bearer <ваш_токен_авторизации>'
        example: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'
      - name: id_group
        in: path
        type: integer
        required: true
        description: ID типа блюда
        example: 1
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            type:
              type: string
              example: "завтрак"
    responses:
      200:
        description: Тип блюда обновлён
        schema:
          type: object
          properties:
            message:
              type: string
      404:
        description: Тип блюда не найден
        schema:
          type: object
          properties:
            message:
              type: string
    """
    dishtype = DishType.query.get(id_group)
    if not dishtype:
        return jsonify({'message': 'Тип блюда не найден'}), 404
    data = request.json
    if 'type' in data:
        dishtype.type = data['type']
    db.session.commit()
    return jsonify({'message': 'Тип блюда обновлён'})

@app.route('/api/dishtypes/<int:id_group>', methods=['DELETE'])
@admin_required
def delete_dishtype(id_group):
    """
    Удалить тип блюда по id (только для администратора)
    ---
    tags:
      - Типы блюд
    security:
      - Bearer: []
    parameters:
      - in: header
        name: Authorization
        required: true
        type: string
        description: 'Bearer <ваш_токен_авторизации>'
        example: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'
      - name: id_group
        in: path
        type: integer
        required: true
        description: ID типа блюда
        example: 1
    responses:
      200:
        description: Тип блюда удалён
        schema:
          type: object
          properties:
            message:
              type: string
      404:
        description: Тип блюда не найден
        schema:
          type: object
          properties:
            message:
              type: string
    """
    dishtype = DishType.query.get(id_group)
    if not dishtype:
        return jsonify({'message': 'Тип блюда не найден'}), 404
    db.session.delete(dishtype)
    db.session.commit()
    return jsonify({'message': 'Тип блюда удалён'})

@app.route('/api/seasons', methods=['POST'])
@admin_required
def create_season():
    """
    Добавить сезон (только для администратора)
    ---
    tags:
      - Справочники
    security:
      - Bearer: []
    parameters:
      - in: header
        name: Authorization
        required: true
        type: string
        description: 'Bearer <ваш_токен_авторизации>'
        example: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - name_season
          properties:
            name_season:
              type: string
              example: "Лето"
    responses:
      201:
        description: Сезон добавлен
        schema:
          type: object
          properties:
            id_season:
              type: integer
            name_season:
              type: string
    """
    data = request.json
    season = Season(name_season=data['name_season'])
    db.session.add(season)
    db.session.commit()
    return jsonify({'id_season': season.id_season, 'name_season': season.name_season}), 201

@app.route('/api/seasons/<int:id_season>', methods=['DELETE'])
@admin_required
def delete_season(id_season):
    """
    Удалить сезон по id (только для администратора)
    ---
    tags:
      - Справочники
    security:
      - Bearer: []
    parameters:
      - in: header
        name: Authorization
        required: true
        type: string
        description: 'Bearer <ваш_токен_авторизации>'
        example: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'
      - name: id_season
        in: path
        type: integer
        required: true
        description: ID сезона
        example: 1
    responses:
      200:
        description: Сезон удалён
        schema:
          type: object
          properties:
            message:
              type: string
      404:
        description: Сезон не найден
        schema:
          type: object
          properties:
            message:
              type: string
    """
    season = Season.query.get(id_season)
    if not season:
        return jsonify({'message': 'Сезон не найден'}), 404
    db.session.delete(season)
    db.session.commit()
    return jsonify({'message': 'Сезон удалён'})

@app.route('/api/recipes', methods=['POST'])
@admin_required
def create_recipe():
    """
    Добавить рецепт (только для администратора)
    ---
    tags:
      - Рецепты
    security:
      - Bearer: []
    parameters:
      - in: header
        name: Authorization
        required: true
        type: string
        description: 'Bearer <ваш_токен_авторизации>'
        example: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - id_dish
            - id_product
            - gramms
          properties:
            id_dish:
              type: integer
              example: 1
            id_product:
              type: integer
              example: 1
            gramms:
              type: integer
              example: 100
    responses:
      201:
        description: Рецепт добавлен
        schema:
          type: object
          properties:
            id_dish:
              type: integer
            id_product:
              type: integer
            gramms:
              type: integer
    """
    data = request.json
    recipe = Recipe(
        id_dish=data['id_dish'],
        id_product=data['id_product'],
        gramms=data['gramms']
    )
    db.session.add(recipe)
    db.session.commit()
    return jsonify({'id_dish': recipe.id_dish, 'id_product': recipe.id_product, 'gramms': recipe.gramms}), 201

@app.route('/api/recipes/<int:id_dish>/<int:id_product>', methods=['GET'])
def get_recipe(id_dish, id_product):
    """
    Получить рецепт по id блюда и id продукта
    ---
    tags:
      - Рецепты
    parameters:
      - name: id_dish
        in: path
        type: integer
        required: true
        description: ID блюда
        example: 1
      - name: id_product
        in: path
        type: integer
        required: true
        description: ID продукта
        example: 1
    responses:
      200:
        description: Рецепт
        schema:
          type: object
          properties:
            id_dish:
              type: integer
            id_product:
              type: integer
            gramms:
              type: integer
      404:
        description: Рецепт не найден
        schema:
          type: object
          properties:
            message:
              type: string
    """
    recipe = Recipe.query.get((id_dish, id_product))
    if not recipe:
        return jsonify({'message': 'Рецепт не найден'}), 404
    return jsonify({'id_dish': recipe.id_dish, 'id_product': recipe.id_product, 'gramms': recipe.gramms})

@app.route('/api/recipes/<int:id_dish>/<int:id_product>', methods=['PUT'])
@admin_required
def update_recipe(id_dish, id_product):
    """
    Обновить рецепт по id блюда и id продукта (только для администратора)
    ---
    tags:
      - Рецепты
    security:
      - Bearer: []
    parameters:
      - in: header
        name: Authorization
        required: true
        type: string
        description: 'Bearer <ваш_токен_авторизации>'
        example: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'
      - name: id_dish
        in: path
        type: integer
        required: true
        description: ID блюда
        example: 1
      - name: id_product
        in: path
        type: integer
        required: true
        description: ID продукта
        example: 1
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            gramms:
              type: integer
              example: 150
    responses:
      200:
        description: Рецепт обновлён
        schema:
          type: object
          properties:
            message:
              type: string
      404:
        description: Рецепт не найден
        schema:
          type: object
          properties:
            message:
              type: string
    """
    recipe = Recipe.query.get((id_dish, id_product))
    if not recipe:
        return jsonify({'message': 'Рецепт не найден'}), 404
    data = request.json
    if 'gramms' in data:
        recipe.gramms = data['gramms']
    db.session.commit()
    return jsonify({'message': 'Рецепт обновлён'})

@app.route('/api/recipes/<int:id_dish>/<int:id_product>', methods=['DELETE'])
@admin_required
def delete_recipe(id_dish, id_product):
    """
    Удалить рецепт по id блюда и id продукта (только для администратора)
    ---
    tags:
      - Рецепты
    security:
      - Bearer: []
    parameters:
      - in: header
        name: Authorization
        required: true
        type: string
        description: 'Bearer <ваш_токен_авторизации>'
        example: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'
      - name: id_dish
        in: path
        type: integer
        required: true
        description: ID блюда
        example: 1
      - name: id_product
        in: path
        type: integer
        required: true
        description: ID продукта
        example: 1
    responses:
      200:
        description: Рецепт удалён
        schema:
          type: object
          properties:
            message:
              type: string
      404:
        description: Рецепт не найден
        schema:
          type: object
          properties:
            message:
              type: string
    """
    recipe = Recipe.query.get((id_dish, id_product))
    if not recipe:
        return jsonify({'message': 'Рецепт не найден'}), 404
    db.session.delete(recipe)
    db.session.commit()
    return jsonify({'message': 'Рецепт удалён'})

@app.route('/api/users', methods=['POST'])
@admin_required
def create_user():
    """
    Добавить пользователя (только для администратора)
    ---
    tags:
      - Пользователи
    security:
      - Bearer: []
    parameters:
      - in: header
        name: Authorization
        required: true
        type: string
        description: 'Bearer <ваш_токен_авторизации>'
        example: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - name_user
            - email
            - age
            - id_country
            - sex
          properties:
            name_user:
              type: string
              example: "Иван"
            email:
              type: string
              example: "ivan@mail.ru"
            age:
              type: string
              example: "2000-01-01"
            id_country:
              type: integer
              example: 1
            sex:
              type: string
              example: "male"
    responses:
      201:
        description: Пользователь добавлен
        schema:
          type: object
          properties:
            id_user:
              type: integer
            name_user:
              type: string
    """
    data = request.json
    age = None
    if 'age' in data and data['age']:
        try:
            age = datetime.strptime(data['age'], "%Y-%m-%d").date()
        except Exception:
            return jsonify({'message': 'Некорректный формат даты, используйте YYYY-MM-DD'}), 400
    user = Human(
        name_user=data['name_user'],
        email=data['email'],
        age=age,
        id_country=data['id_country'],
        sex=data['sex']
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({'id_user': user.id_user, 'name_user': user.name_user}), 201

@app.route('/api/users/<int:id_user>', methods=['DELETE'])
@admin_required
def delete_user(id_user):
    """
    Удалить пользователя по id (только для администратора)
    ---
    tags:
      - Пользователи
    security:
      - Bearer: []
    parameters:
      - in: header
        name: Authorization
        required: true
        type: string
        description: 'Bearer <ваш_токен_авторизации>'
        example: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'
      - name: id_user
        in: path
        type: integer
        required: true
        description: ID пользователя
        example: 1
    responses:
      200:
        description: Пользователь удалён
        schema:
          type: object
          properties:
            message:
              type: string
      404:
        description: Пользователь не найден
        schema:
          type: object
          properties:
            message:
              type: string
    """
    user = Human.query.get(id_user)
    if not user:
        return jsonify({'message': 'Пользователь не найден'}), 404
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'Пользователь удалён'})

@app.route('/api/orders/<int:id_order>', methods=['DELETE'])
@admin_required
def delete_order(id_order):
    """
    Удалить заказ по id (только для администратора)
    ---
    tags:
      - Заказы
    security:
      - Bearer: []
    parameters:
      - in: header
        name: Authorization
        required: true
        type: string
        description: 'Bearer <ваш_токен_авторизации>'
        example: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'
      - name: id_order
        in: path
        type: integer
        required: true
        description: ID заказа
        example: 1
    responses:
      200:
        description: Заказ удалён
        schema:
          type: object
          properties:
            message:
              type: string
      404:
        description: Заказ не найден
        schema:
          type: object
          properties:
            message:
              type: string
    """
    order = OrderOfDishes.query.get(id_order)
    if not order:
        return jsonify({'message': 'Заказ не найден'}), 404
    db.session.delete(order)
    db.session.commit()
    return jsonify({'message': 'Заказ удалён'})

@app.route('/api/ratings/<int:id_rate>', methods=['DELETE'])
@admin_required
def delete_rating(id_rate):
    """
    Удалить рейтинг по id (только для администратора)
    ---
    tags:
      - Рейтинги
    security:
      - Bearer: []
    parameters:
      - in: header
        name: Authorization
        required: true
        type: string
        description: 'Bearer <ваш_токен_авторизации>'
        example: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'
      - name: id_rate
        in: path
        type: integer
        required: true
        description: ID рейтинга
        example: 1
    responses:
      200:
        description: Рейтинг удалён
        schema:
          type: object
          properties:
            message:
              type: string
      404:
        description: Рейтинг не найден
        schema:
          type: object
          properties:
            message:
              type: string
    """
    rating = DishRating.query.get(id_rate)
    if not rating:
        return jsonify({'message': 'Рейтинг не найден'}), 404
    db.session.delete(rating)
    db.session.commit()
    return jsonify({'message': 'Рейтинг удалён'})

@app.route('/api/chiefs', methods=['POST'])
@admin_required
def create_chief():
    """
    Добавить шефа (только для администратора)
    ---
    tags:
      - Шефы
    security:
      - Bearer: []
    parameters:
      - in: header
        name: Authorization
        required: true
        type: string
        description: 'Bearer <ваш_токен_авторизации>'
        example: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - name_chief
            - id_country
            - exp_years
          properties:
            name_chief:
              type: string
              example: "Гордон Рамзи"
            id_country:
              type: integer
              example: 1
            exp_years:
              type: integer
              example: 10
    responses:
      201:
        description: Шеф добавлен
        schema:
          type: object
          properties:
            id_chief:
              type: integer
            name_chief:
              type: string
    """
    data = request.json
    chief = Chief(
        name_chief=data['name_chief'],
        id_country=data['id_country'],
        exp_years=data['exp_years']
    )
    db.session.add(chief)
    db.session.commit()
    return jsonify({'id_chief': chief.id_chief, 'name_chief': chief.name_chief}), 201

if __name__ == '__main__':
    app.run(debug=True)
