from flask import Flask, request, jsonify
from binance.um_futures import UMFutures
from binance.error import ClientError
from flask_cors import CORS
from dotenv import load_dotenv
import os, time

# .env dosyasını yükleyin
load_dotenv()

app = Flask(__name__)
CORS(app)  # Tüm kaynaklardan gelen isteklere izin verir

# Binance API anahtarlarınızı buraya ekleyin
api_key = os.getenv('BINANCE_API_KEY')
api_secret = os.getenv('BINANCE_SECRET_KEY')
STOP_LOSS_PERCENT = 0.02
MARGIN_TYPE = "ISOLATED"

print("apikey:", api_key)
print("apisecret:", api_secret)

# Binance Futures API'ye bağlan
client = UMFutures(api_key, api_secret)


def get_full_symbol(short_name):
    """Girilen kısa coinin adından tam sembolü döndürür"""
    try:
        # Tüm işlem çiftlerini alın
        exchange_info = client.exchange_info()
        symbols = exchange_info['symbols']
        
        # Kullanıcının girdiği kısa adla eşleşen sembolü bulun
        for symbol_data in symbols:
            # Örneğin, `PEPEUSDT` veya `1000PEPEUSDT`
            if symbol_data['symbol'].endswith('USDT') and short_name.upper() in symbol_data['symbol']:
                return symbol_data['symbol']
        
        return None  # Eşleşen sembol yoksa None döndür

    except ClientError as error:
        print(f"Hata: {error}")
        return None


def get_qty_precision(symbol):
    resp = client.exchange_info()['symbols']
    for elem in resp:
        if elem['symbol'] == symbol:
            return elem['quantityPrecision']


def get_price_precision(symbol):
    resp = client.exchange_info()['symbols']
    for elem in resp:
        if elem['symbol'] == symbol:
            return elem['pricePrecision']


@app.route('/', methods=['POST'])
def checks():
    pass


@app.route('/command', methods=['POST'])
def open_position():
    try:
        # JSON isteğinden gerekli bilgileri al
        data = request.get_json()
        symbol = get_full_symbol(data.get('symbol'))
        # symbol = data.get('symbol').upper() + "USDT"  # Örsymbolneğin: BTCUSDT
        leverage = int(data.get('leverage'))  # Örneğin: 10
        usdt_amount = 10
    
        # Kaldıraç ayarla
        lev_response = client.change_leverage(symbol=symbol, leverage=leverage, recvWindow=6000)
        print(f"Margin tipi ayarlandı: {lev_response}")

        margin_response = client.change_margin_type(symbol=symbol, marginType=MARGIN_TYPE, recvWindow=6000)
        print(f"Margin tipi ayarlandı: {margin_response}")

        # print("Kaldıraç ayarlandı:", temp)
        print("LEVERAGE TEST----------------------------------------------------------------")

        price = float(client.mark_price(symbol=symbol)["markPrice"])
        
        qty_precision = get_qty_precision(symbol)
        price_precision = get_price_precision(symbol)
        quantity = round(usdt_amount/price, qty_precision)

        print("price: ", price)
        print("quantity: ", quantity)


        #ÇALIŞIYORRRR
        
        # Long pozisyon açma
        order = client.new_order(
            symbol=symbol,
            side="BUY",  # Long işlem için "BUY", short işlem için "SELL" seç
            type="MARKET",
            quantity=quantity,
        )
        print("Order:", order)

        time.sleep(0.5)
        

        """
        
    
        # Stop-loss emri ekle
        client.new_order(
            symbol=symbol,
            side="SELL",
            type="STOP_MARKET",
            stopPrice=stop_loss_price,
            quantity=quantity,
            positionSide="LONG",  # Sadece bu long pozisyon için geçerli olur
            reduceOnly=True,  # Pozisyonu yalnızca kapatmak için stop-loss kullanır
            newClientOrderId=f"stop_loss_{order_id}"  # Her stop-loss için benzersiz bir ID
        )
        """


        # Stop-loss fiyatını hesapla (en fazla %5 kayıp)
        max_loss_percent = 5  # Maksimum kayıp yüzdesi
        #stop_loss_price = price - (price * (max_loss_percent / 100) / leverage)

        stop_loss_price = round(price - price*STOP_LOSS_PERCENT, price_precision) # eski koddan

        # sanırım bu daha doğru bir stoploss hesaplama oldu
        # stop_loss_price = round(price - (price * STOP_LOSS_PERCENT / leverage), price_precision)

        print("stop_loss_percent: ", stop_loss_price)
        print("stop_loss_percent",round(stop_loss_price, 2))


        order_id = order['orderId']
        # StopLoss pozisyon açma -------------- CLAUDIA
        stop_loss_order = client.new_order(
            symbol=symbol,
            side="SELL",
            type="STOP_MARKET", 
            stopPrice=round(stop_loss_price, price_precision),
            # quantity=quantity,    # stop_market ile gönderilmemeliymiş
            closePosition=True,     # TODO: denenmedi
            orderId=order_id
        )



        """

        ÇALIŞIYORRR GLOBAL stoplos
        # Stop-loss emri gönder
        stop_loss_order = client.new_order(
            symbol=symbol,
            side="SELL",  # Long pozisyon için "SELL", short pozisyon için "BUY"
            type="STOP_MARKET",
            stopPrice=round(stop_loss_price, price_precision),  # Stop fiyatını yuvarla   
            quantity=quantity,
        )
        """
        print("Stop-loss order:", stop_loss_order)


        """
        return jsonify({
            "message": "Emir başarıyla oluşturuldu.",
            "order": order,
            "stop_loss_order": stop_loss_order
        }), 200
        """
        

        # JSON yanıtı için doğru format
        return jsonify({"message": "HELLOOĞĞĞĞĞĞ"}), 200

    except ValueError:
        print("Hata: JSON verisi okunamadı.")
        return jsonify({"error": "Geçersiz JSON verisi"}), 400


# TODO: long ve short pozisyon açma işlemlerini düzenle
@app.route('/long', methods=['POST'])
def long_position():
    print("LOONNNNNNNNNNNGGGGGGGGGGGGGGGGGGGGGGGGG")
    data = request.json
    coin = data.get("coin")
    leverage = data.get("leverage")
    # Long pozisyon açma işlemleri burada yapılır.
    return jsonify({"status": f"long posizyon açıldı coin: {coin}, leverage: {leverage}"})


@app.route('/short', methods=['POST'])
def short_position():
    print("SHOORRRRRRRRRTTTTTTTTTTTTTTTTTTTTTTTTTTT")
    data = request.json
    coin = data.get("coin")
    leverage = data.get("leverage")
    # Long pozisyon açma işlemleri burada yapılır.
    return jsonify({"status": f"long posizyon açıldı coin: {coin}, leverage: {leverage}"})


@app.route("/checks", methods=["GET"])
def checks():
    binance.check_connection()

if __name__ == '__main__':
    app.run(debug=True)




"""

        # Kaldıraç ayarla
        #client.change_leverage(symbol=symbol, leverage=leverage)
    
        print("LEVERAGE TEST")

        # Mevcut fiyatı al ve miktarı hesapla
        price = float(client.mark_price(symbol=symbol)["markPrice"])
        quantity = round(usdt_amount / price, 6)  # BTC miktarını fiyat üzerinden hesapla

        print("----------------------------------------------------------------")
        print("symbol",symbol,"quantity",quantity,"price",price)
        # Long pozisyon açma
        order = client.new_order(
            symbol=symbol,
            side="BUY",  # Long işlem için "BUY", short işlem için "SELL" seç
            type="MARKET",
            quantity=quantity,
        )

        # Stop-loss fiyatını hesapla (en fazla %5 kayıp)
        max_loss_percent = 5  # Maksimum kayıp yüzdesi
        stop_loss_price = price - (price * (max_loss_percent / 100) / leverage)

        # Stop-loss emri gönder
        stop_loss_order = client.new_order(
            symbol=symbol,
            side="SELL",  # Long pozisyon için "SELL", short pozisyon için "BUY"
            type="STOP_MARKET",
            stopPrice=round(stop_loss_price, 2),  # Stop fiyatını yuvarla   
            quantity=quantity,
        )

        return jsonify({
            "message": "Emir başarıyla oluşturuldu.",
            "order": order,
            "stop_loss_order": stop_loss_order
        }), 200

#    except ClientError as e:
#        return jsonify({"error": str(e)}), 400
    except Exception as e:
        print("Status Code:", e.status_code)
        #print("Error Message:", e.message)
        print("Full Error Response:", e)
        return jsonify({"error": e}), 400

"""