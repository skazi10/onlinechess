import time


class SimpleDelay:
    def __init__(self, mt, bt):
        self.started = False
        self.imt = mt
        self.ibt = bt
        self.wmt = mt
        self.bmt = mt
        self.wbt = bt
        self.bbt = bt
        self.turn = 'w'

    def start(self):
        self.start_time = time.time()
        self.started = True

    def get_times(self):
        if not self.started:
            return

        self.end_time = time.time()
        duration = self.end_time - self.start_time
        if self.turn == 'w':
            if duration <= self.wmt:
                self.wmt = self.wmt - duration
                self.start_time = time.time()
                return self.wmt, self.wbt, self.bmt, self.bbt
            elif duration > self.wmt:
                self.wbt = self.wbt + self.wmt - duration
                self.wmt = 0
                self.start_time = time.time()
                return self.wmt, self.wbt, self.bmt, self.bbt
        if self.turn == 'b':
            if duration <= self.bmt:
                self.bmt = self.bmt - duration
                self.start_time = time.time()
                return self.wmt, self.wbt, self.bmt, self.bbt
            elif duration > self.bmt:
                self.bbt = self.bbt + self.bmt - duration
                self.bmt = 0
                self.start_time = time.time()
                return self.wmt, self.wbt, self.bmt, self.bbt

    def end_turn(self):
        print('in method')
        self.get_times()
        if self.turn == 'w':
            self.wmt = self.imt
            self.turn = 'b'
        else:
            self.bmt = self.imt
            self.turn = 'w'
