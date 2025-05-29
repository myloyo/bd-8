from models import db, DishRating
from datetime import datetime


def update_dish_rating(user_id, dish_id, rate, comment=None, id_rate=None):
    if rate < 1 or rate > 5:
        return {'success': False, 'message': 'Rating must be between 1 and 5'}

    try:
        if id_rate:
            rating = DishRating(
                id_rate=id_rate,
                id_user=user_id,
                id_dish=dish_id,
                rate=rate,
                comment=comment,
                date=datetime.now()
            )
        else:
            rating = DishRating(
                id_user=user_id,
                id_dish=dish_id,
                rate=rate,
                comment=comment,
                date=datetime.now()
            )

        db.session.add(rating)
        db.session.commit()
        return {'success': True, 'message': 'Rating added successfully'}
    except Exception as e:
        return {'success': False, 'message': str(e)}


def get_dish_ratings(min_rating=3):
    # Здесь должна быть реализация вашей SQL-процедуры
    # Возвращаем пример данных
    return [
        {
            'dish_id': 1,
            'dish_name': 'Sample Dish',
            'avg_rating': 4.5,
            'comments': 'Excellent; Very tasty'
        }
    ]
