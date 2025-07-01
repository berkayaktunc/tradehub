from flask import Flask, request, jsonify
from flask_cors import CORS
from binanceExc import BinanceExchange as binance
import time

app = Flask(__name__)
CORS(app)
bn = binance()


@app.route('/', methods=['POST'])
def checks():
    bn.check_connection()
    return jsonify({'message': 'Connected'}), 200


@app.route('/check', methods=['GET','POST'])
def check():
    temp = bn.check_connection()
    status_code = temp[1]

    if status_code == 200:
        return jsonify({'message': 'Binance bağlantı başarılı'}), 200
    else:
        return jsonify({'error': 'keyleri kontrol et'}), 400


@app.route('/test', methods=['GET','POST'])
def test():
    print("TESTED!")
    temp = {'message': "HEREEE"}
    temp["message"] += " <br> asdasd"
    
    return jsonify({'message':["TESTED!!!"]}), 200


@app.route('/command', methods=['POST'])
def position():
    data = request.get_json()
    symbol = data.get('symbol').upper()
    leverage = int(data.get('leverage'))
    side = "BUY"

    if leverage < 0:
        side = "SELL"

    msg1, order_id = bn.create_position(symbol, side ,leverage)
    if order_id == 0:
        return jsonify({'message': [msg1]}), 200

    time.sleep(0.5)

    flag, msg2 = bn.create_stoploss(symbol, side, order_id)
    if flag == 0:
        return jsonify({'message': [msg1, msg2]}), 200
    
    return jsonify({'error':[msg1, msg2]}), 400


@app.route('/info', methods=['GET'])
def get_info():
    msg = bn.__str__()

    return jsonify({'message': msg}), 200

@app.route('/_setLeverage', methods=['GET','POST'])
def setLev():
    data = request.get_json()
    leverage = data.get('leverage')

    if leverage is None:
        return jsonify({'error': ['Leverage parameter is missing']}), 400
    
    try:
        leverage = int(leverage)
        if leverage > 75 or leverage < 1:
            return jsonify({'error': ['Leverage must be 75<=leverage<=1']}), 400
        
        msg = bn._set_LEVERAGE(leverage)
        return jsonify({'message': [msg]}), 200
    except ValueError:
        return jsonify({'error': ['Leverage must be a valid integer']}), 400
    except Exception as e:
        return jsonify({'error': [f'error: {e}']}), 400


@app.route('/_setStoploss', methods=['GET','POST'])
def setStoploss():
    data = request.get_json()
    stoploss = data.get('stoploss')

    if stoploss is None:
        return jsonify({'error': ['stoploss parameter is missing']}), 400
    
    try:
        stoploss = int(stoploss)
        if stoploss > 100 or stoploss < 1:
            return jsonify({'error': ['stoploss must be 100<=stoploss<=1']}), 400
        
        msg = bn._set_STOP_LOSS_PERCENT(float(stoploss/100))
        return jsonify({'message': [msg]}), 200
    except ValueError:
        return jsonify({'error': ['stoploss must be a valid integer']}), 400
    except Exception as e:
        return jsonify({'error': [f'error: {e}']}), 400


@app.route('/_setMargin', methods=['GET','POST'])
def setMarg():
    test = ["ISOLATED", "CROSS"]
    data = request.get_json()
    margin = data.get('margin')

    if (margin is None or margin.upper() not in test):
        return jsonify({'error': ['Margin parameter is missing or should be ISOLATED or CROSS.']}), 400

    try:
        margin = margin.upper()
        msg = bn._set_MARGIN_TYPE(margin)

        return jsonify({'message': [msg]}), 200
    except ValueError:
        return jsonify({'error': ['Margin must be a valid string']}), 400
    except Exception as e:
        return jsonify({'error': [f'error: {e}']}), 400


@app.route('/_deleteKeys', methods=['POST'])
def delete_ENV():
    flag, msg = bn._delete_ENV()

    if flag == 0:
        return jsonify({'error': [msg]}), 400
    return jsonify({'message': [msg]}), 200


@app.route('/_saveKeys', methods=['POST'])
def save_keys():
    data = request.get_json()
    api_key = data.get('api_key')
    secret_key = data.get('secret_key')

    if not api_key or not secret_key:
        return jsonify({'error': ['API Key ve Secret Key gereklidir']}), 400

    try:
        # API key'leri .env dosyasına kaydet
        flag, msg = bn._set_ENV_VAL('BINANCE_API_KEY', api_key)
        if flag == 0:
            return jsonify({'error': [msg]}), 400
        
        flag, msg = bn._set_ENV_VAL('BINANCE_SECRET_KEY', secret_key)
        if flag == 0:
            return jsonify({'error': [msg]}), 400

        # Binance client'ı yeniden başlat
        bn.__init__()
        
        return jsonify({'message': ['API key\'ler başarıyla kaydedildi']}), 200
    except Exception as e:
        return jsonify({'error': [f'Hata: {e}']}), 400


@app.route('/_getKeys', methods=['GET'])
def get_keys():
    try:
        api_key = bn._get_ENV_VAR('BINANCE_API_KEY')
        secret_key = bn._get_ENV_VAR('BINANCE_SECRET_KEY')
        
        # API key'lerin sadece ilk 4 karakterini göster
        masked_api_key = api_key[:4] + '*' * (len(api_key) - 8) + api_key[-4:] if api_key else ''
        masked_secret_key = secret_key[:4] + '*' * (len(secret_key) - 8) + secret_key[-4:] if secret_key else ''
        
        return jsonify({
            'api_key': masked_api_key,
            'secret_key': masked_secret_key,
            'has_keys': bool(api_key and secret_key)
        }), 200
    except Exception as e:
        return jsonify({'error': [f'Hata: {e}']}), 400


@app.route('/open_orders', methods=['GET'])
def open_orders():
    try:
        orders = bn.get_open_orders()
        return jsonify({'orders': orders}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)