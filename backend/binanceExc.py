from binance.um_futures import UMFutures
from binance.error import ClientError
from dotenv import load_dotenv, set_key
import os

# .env dosyasını yükleyin
load_dotenv()

class BinanceExchange:
    def __init__(self):
        self.api_key = os.getenv('BINANCE_API_KEY')
        self.api_secret = os.getenv('BINANCE_SECRET_KEY')
        self.client = UMFutures(self.api_key, self.api_secret)

        self.STOP_LOSS_PERCENT = 0.02
        self.MARGIN_TYPE = "ISOLATED"
        self.LEVERAGE = 10
        self.USD_AMOUNT = 10

        self.EXCHANGE_INFO = self.client.exchange_info()
        symbols = self.EXCHANGE_INFO['symbols']
        self.USDT_PAIRS = [symbol['symbol'] for symbol in symbols if symbol['quoteAsset'] == 'USDT']

    def _delete_ENV(self):
        env_file = ".env"
    
        # .env dosyasının var olup olmadığını kontrol et
        if os.path.exists(env_file):
            os.remove(env_file)
            return 1, f"{env_file} dosyası başarıyla silindi."
        return 0, f"{env_file} dosyası bulunamadı."

    def _set_STOP_LOSS_PERCENT(self, STOP_LOSS_PERCENT=None):
        self.STOP_LOSS_PERCENT = STOP_LOSS_PERCENT or self.STOP_LOSS_PERCENT
        return f"Stoploss set to: {self.STOP_LOSS_PERCENT}"
    
    def _set_USD_AMOUNT(self, USD_AMOUNT=None):
        self.USD_AMOUNT = USD_AMOUNT or self.USD_AMOUNT
        return f"USD_AMOUNT set to: {self.USD_AMOUNT}"
    
    def _set_LEVERAGE(self, LEVERAGE=None):
        self.LEVERAGE = LEVERAGE or self.LEVERAGE
        return f"LEVERAGE set to: {self.LEVERAGE}"
    
    def _set_MARGIN_TYPE(self, MARGIN_TYPE=None):
        self.MARGIN_TYPE = MARGIN_TYPE or self.MARGIN_TYPE
        return f"MARGIN_TYPE set to: {self.MARGIN_TYPE}"
    


    def check_connection(self):
        try:
            # Ping endpoint'i ile bağlantıyı kontrol et
            response = self.client.ping()
            if response == {}:  # Ping başarılı olursa boş bir sözlük döner
                return ["Binance bağlantı başarılı"], 200
            else:
                return ["Error: Binance bağlantıda bir sorun var", response], 500
                #return "Bağlantıda bir sorun var"
        except Exception as e:
            return ["Error: Geçersiz JSON verisi", e], 400


    def create_position(self, symbol, leverage, usdt_amount=None):
        try:
            symbol = self.get_full_symbol(symbol)
            usdt_amount = usdt_amount or self.USD_AMOUNT

            # Kaldıraç ayarla
            if (self.get_leverage(symbol) != leverage):
                lev_response = self.set_leverage(symbol, leverage)
                print(f"Margin tipi ayarlandı: {lev_response}")

            #if (self.get_margin_type(symbol) != self.MARGIN_TYPE):
            margin_response = self.set_margin_type(symbol, self.MARGIN_TYPE)
            print(f"Margin tipi ayarlandı: {margin_response}")

            # print("Kaldıraç ayarlandı:", temp)
            print("LEVERAGE TEST----------------------------------------------------------------")

            price = float(self.get_mark_price(symbol=symbol))
            
            qty_precision = self.get_qty_precision(symbol)
            quantity = round(usdt_amount * leverage / price, qty_precision)

            print("price: ", price)
            print("quantity: ", quantity)
            print("symbol: ", symbol)

            order = self.client.new_order(
                symbol=symbol,
                side="BUY",  # Long işlem için "BUY", short işlem için "SELL" seç
                type="MARKET",
                quantity=quantity,
            )

            print("----------------------------------------------------------------")
            print(f"Entry price: {price}, ORDER: {order['orderId']}")
            return "Entry price: {price}", order['orderId']

        except ClientError as error:
            return ["Cannot create position",f"{error.error_message}"], 0

    def create_stoploss(self, symbol, order_id=None):
        try:
            symbol = self.get_full_symbol(symbol)

            price = float(self.client.mark_price(symbol=symbol)["markPrice"])
            price_precision = self.get_price_precision(symbol)
            stop_loss_price = round(price - price*self.STOP_LOSS_PERCENT, price_precision)

            # StopLoss pozisyon açma
            stop_loss_order = self.client.new_order(
                symbol=symbol,
                side="SELL",
                type="STOP_MARKET", 
                stopPrice=round(stop_loss_price, price_precision),
                # quantity=quantity,    # stop_market ile gönderilmemeliymiş
                closePosition=True,     # TODO: denenmedi
                orderId=order_id
            )

            return 1, f"Stop loss price: {stop_loss_price}"

        except ClientError as error:
            return 0, ["Error: stoploss not created",f"{error.error_message}"]
    
    def get_leverage(self, symbol):
        try:
            response = self.client.leverage_brackets(symbol=symbol, recvWindow=6000)
            return response
        except ClientError as error:
            return 0

    def set_leverage(self, symbol, leverage=None):
        leverage = leverage or self.LEVERAGE
        try:
            response = self.client.change_leverage(
                symbol=symbol, leverage=leverage, recvWindow=6000
            )
            return[f"Margin tipi ayarlandı: {response}"]
        except ClientError as error:
            return [f"Error {error.error_message}"]

    def set_margin_type(self, symbol, marginType=None):
        marginType = marginType or self.MARGIN_TYPE
        #temp = self.client.change_margin_type(symbol=symbol, marginType=marginType, recvWindow=6000)
        
        try:
            response = self.client.change_margin_type(
                symbol=symbol, marginType=marginType, recvWindow=6000
            )
            return f"Margin type set: {response}"
        except ClientError as error:
            return [f"Error {error.error_message}"]
    
    def get_qty_precision(self, symbol):
        resp = self.EXCHANGE_INFO['symbols']
        for elem in resp:
            if elem['symbol'] == symbol:
                return elem['quantityPrecision']

    def get_price_precision(self, symbol):
        resp = self.EXCHANGE_INFO['symbols']
        for elem in resp:
            if elem['symbol'] == symbol:
                return elem['pricePrecision']
    
    def get_full_symbol(self, short_name):
        """Girilen kısa coinin adından tam sembolü döndürür"""
        
        for symbol_data in self.USDT_PAIRS:
            # Örneğin, `PEPEUSDT` veya `1000PEPEUSDT`
            if symbol_data.endswith('USDT') and str(short_name).upper() in symbol_data:
                return str(symbol_data)

        return None  # Eşleşen sembol yoksa None döndür


    def get_mark_price(self, symbol):
        return self.client.mark_price(symbol=symbol)["markPrice"]

    
    def __str__(self):
        temp = [
            f"StopLossRatio: {int(self.STOP_LOSS_PERCENT*100)}%", 
            f"MarginType: {self.MARGIN_TYPE}", 
            f"Leverage: {self.LEVERAGE}", 
            f"Usd Amount: {self.USD_AMOUNT}"
        ]
        return temp
    

    def _set_ENV_VAL(self, key, val):
        load_dotenv()
        # .env dosyasındaki mevcut değeri yazdırma
        current_test_value = os.getenv(key)
        print(f"Current {key} value: {current_test_value}")

        env_file = ".env"  # .env dosyasının yolu
        
        # .env dosyasındaki key'i güncelleme
        set_key(env_file, key, val)
        print(f"Updated ----------------------------------{key} {val}")

        # .env dosyasını tekrar yükleyerek Python ortamındaki değeri güncelleme
        load_dotenv()  # Değişikliklerin Python ortamına yansıması için tekrar yükle
        
        # Güncellenen değeri kontrol et
        updated_test_value = os.getenv(key)
        print(f"Updated {key} value: {updated_test_value}")


    def _get_ENV_VAR(self, key):
        load_dotenv()
        return os.getenv(key)



"""
test = BinanceExchange()
test._set_ENV_VAL("HELOOO22", "222222222222222222222")
print(test.check_connection())
print(test.get_full_symbol('pepe'))
print("BTC quantity precision:",test.get_qty_precision("BTCUSDT"))
print("BTC price precision:",test.get_price_precision("BTCUSDT"))
print("BTC set margin:",test.set_margin_type("BNBUSDT", "ISOLATED"))
print("BTC set leverage:",test.set_leverage("BTCUSDT", 2))
print("BTC mark price:",test.get_mark_price("BTCUSDT"))
 """