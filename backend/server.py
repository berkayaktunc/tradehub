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

    msg1, order_id = bn.create_position(symbol, leverage)
    if order_id == 0:
        return jsonify({'message': [msg1]}), 200

    time.sleep(0.5)

    flag, msg2 = bn.create_stoploss(symbol, order_id)
    if flag == 0:
        return jsonify({'message': [msg1, msg2]}), 200
    
    return jsonify({'error':[msg1, msg2]}), 400


@app.route('/info', methods=['GET'])
def short_position():
    msg = bn.__str__()

    return jsonify({'message': msg}), 200

@app.route('/_setLeverage', methods=['GET','POST'])
def setLev():
    data = request.get_json()
    leverage = str(data.get('leverage'))
     
    msg = bn._set_LEVERAGE(leverage)
    return jsonify({'message': [msg]}), 200
    """

    print(f"GELEN DEGER:  {leverage}")
    bn._set_ENV_VAL("LEVERAGE", leverage)
    load_dotenv()
    print("GEÇTIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII")
    print(f"{str(leverage)} == {str(bn._get_ENV_VAR("LEVERAGE"))}")

    if ( str(leverage) == str(bn._get_ENV_VAR("LEVERAGE"))):
        return jsonify({'message': [f"Leverage set to: {leverage}"]}), 200
    
    return jsonify({'error': ["Could not set leverage"]}), 400
    """

@app.route('/_setMargin', methods=['POST'])
def setMarg():
    data = request.get_json()
    margin = str(data.get('margin')).upper()
    test = ["ISOLATED", "CROSS"]
    if margin not in test:
        return jsonify({'message': "Margin shold be ISOLATED or CROSS"}), 200
    msg = bn._set_MARGIN_TYPE(margin)
    
    return jsonify({'message': [msg]}), 200


@app.route('/_deleteKeys', methods=['POST'])
def delete_ENV():
    flag, msg = bn._delete_ENV()

    if flag == 0:
        return jsonify({'error': [msg]}), 400
    return jsonify({'message': [msg]}), 200


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)