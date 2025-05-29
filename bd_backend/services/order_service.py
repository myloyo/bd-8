from models import db, OrderOfDishes
from datetime import datetime

def create_order(dish_id, user_id):
    try:
        order = OrderOfDishes(
            id_dish=dish_id,
            id_user=user_id,
            date=datetime.now()
        )
        db.session.add(order)
        db.session.commit()
        return {'success': True, 'message': 'Order created', 'order_id': order.id_order}
    except Exception as e:
        return {'success': False, 'message': str(e)}
