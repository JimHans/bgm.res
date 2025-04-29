// 辅助函数：通过点分路径设置嵌套属性
function deepSetCustom(obj, keyPath, value) {
  const keys = keyPath.split('.');
  let current = obj;
  // 遍历除最后一项外的所有键
  for (let i = 0; i < keys.length - 1; i++) {
    if (typeof current[keys[i]] !== 'object' || current[keys[i]] === null) {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
}

// 辅助函数：通过点分路径获取嵌套属性
function deepGet(obj, keyPath, defaultValue) {
  const keys = keyPath.split('.');
  let current = obj;
  for (let key of keys) {
    if (!current || !Object.prototype.hasOwnProperty.call(current, key)) {
      return defaultValue;
    }
    current = current[key];
  }
  return current;
}

class ElectronStoreAdapter {
  constructor(options = {}) {
    // 内存缓存，每个键独立存储
    // 格式： { [topKey]: data, ... }
    this.data = {};
    // 初始化时加载所有存储的文档，每个文档的 _id 为顶层键
    db.find({}, (err, docs) => {
      if (!err && docs) {
        docs.forEach(doc => {
          this.data[doc._id] = doc.data;
        });
      } else {
        console.error('Error loading initial data:', err);
      }
    });
  }

  // get 方法支持点分路径查找，读取不到数据返回 false
  get(keyPath) {
    if (!keyPath) {
      // 返回整个缓存数据
      return this.data;
    }
    const segments = keyPath.split('.');
    const topKey = segments[0];
    if (!this.data.hasOwnProperty(topKey)) return false;
    if (segments.length === 1) return this.data[topKey];
    const subPath = segments.slice(1).join('.');
    return deepGet(this.data[topKey], subPath, false);
  }

  // set 方法支持类似 electron-store 的点分路径存储
  // 示例：store.set("WorkSaveNo1.EPDetails.EP1.Condition", 'Watched')
  set(keyPath, value) {
    const segments = keyPath.split('.');
    const topKey = segments[0];
    // 如果顶层数据不存在或不是对象，则创建新的顶层对象，并保存标识字段
    if (!this.data.hasOwnProperty(topKey) || typeof this.data[topKey] !== 'object') {
      this.data[topKey] = {};
      this.data[topKey]["WorkSaveNo"] = topKey;
    }
    // 若只有顶层键，则直接覆盖，否则更新嵌套结构
    if (segments.length === 1) {
      this.data[topKey] = value;
    } else {
      const subPath = segments.slice(1).join('.');
      deepSetCustom(this.data[topKey], subPath, value);
    }
    // console.log('Setting key:', keyPath, 'to value:', value);
    // 异步持久化到 neDB，确保 _id 为顶层键的文档更新或创建
    db.update({ _id: topKey }, { $set: { data: this.data[topKey] } }, { upsert: true }, err => {
      if (err) console.error('Error saving key:', keyPath, err);
    });
  }

  // 清空所有数据
  clear() {
    this.data = {};
    // 删除所有文档
    db.remove({}, { multi: true }, err => {
      if (err) console.error('Error clearing store:', err);
    });
  }

  // 检查数据中是否存在某个键（支持点分路径）
  has(keyPath) {
    const segments = keyPath.split('.');
    const topKey = segments[0];
    if (!this.data.hasOwnProperty(topKey)) return false;
    if (segments.length === 1) {
      return true;
    }
    const subPath = segments.slice(1).join('.');
    return deepGet(this.data[topKey], subPath, undefined) !== undefined;
  }

  // 使用 neDB 的原生排序操作对所有 type 为 "mediaItem" 的文档进行排序，
  // 并将排序结果通过更新每个文档的 sortIndex 字段写入数据库
  sortDb(sortKey, order = 'asc') {
    return new Promise((resolve, reject) => {
      // 读取所有 _id 形如 "WorkSaveNoX" 的文档
      db.find({ _id: { $regex: /^WorkSaveNo\d+$/ } }, (err, docs) => {
        if (err) {
          console.error('Error fetching documents for sorting:', err);
          return reject(err);
        }
        // 根据排序键排序
        docs.sort((a, b) => {
          let valA = a.data[sortKey];
          let valB = b.data[sortKey];
  
          // 当排序键为 WorkSaveNo 时，提取其中数字进行比较
          if (sortKey === 'WorkSaveNo') {
            const numA = parseInt(String(valA).replace(/[^0-9]+/g, ''), 10);
            const numB = parseInt(String(valB).replace(/[^0-9]+/g, ''), 10);
            return order === 'asc' ? numA - numB : numB - numA;
          }
  
          // 如果是数字，直接比较
          if (typeof valA === 'number' && typeof valB === 'number') {
            return order === 'asc' ? valA - valB : valB - valA;
          } else {
            // 转换为字符串后进行 localeCompare
            valA = String(valA);
            valB = String(valB);
            return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
          }
        });
        // 删除所有符合条件的原有文档
        db.remove({ _id: { $regex: /^WorkSaveNo\d+$/ } }, { multi: true }, (err2) => {
          if (err2) {
            console.error('Error removing old documents:', err2);
            return reject(err2);
          }
          // 重新按排序结果写入新的文档，新 _id 根据排序顺序生成
          const insertPromises = docs.map((doc, index) => {
            const newID = 'WorkSaveNo' + (index + 1);
            const newDoc = {
              _id: newID,
              data: doc.data
            };
            return new Promise((resolveInsert, rejectInsert) => {
              db.insert(newDoc, (err3) => {
                if (err3) {
                  console.error('Error inserting document with new _id', newID, err3);
                  return rejectInsert(err3);
                } else {
                  // 更新内存中的数据
                  this.data[newID] = newDoc.data;
                  resolveInsert(newDoc);
                }
              });
            });
          });
          Promise.all(insertPromises)
            .then(() => {
              // console.log('Sorting completed. New order:', docs.map((_, idx) => 'WorkSaveNo' + (idx + 1)));
              // 返回排序后的整个数据，与 store.get() 返回值一致
              resolve(this.data);
            })
            .catch(reject);
        });
      });
    });
  }

  // 新增 update 方法：重新加载数据库并更新内存缓存
  update() {
    return new Promise((resolve, reject) => {
      // 强制加载数据库
      db.loadDatabase(err => {
        if (err) {
          console.error('Error reloading database:', err);
          return reject(err);
        }
        // 加载完成后，再读取数据库并更新缓存
        db.find({}, (err2, docs) => {
          if (err2) {
            console.error('Error updating cache from database:', err2);
            return reject(err2);
          }
          // 清空现有缓存，并重新填充
          this.data = {};
          docs.forEach(doc => {
            this.data[doc._id] = doc.data;
          });
          resolve(this.data);
        });
      });
    });
  }

  /**
  * 记录最近播放信息：
  * 最多保存30条记录，新记录添加到数组尾部，若超过30条则删除最早的一条记录
  * 如果记录中已存在相同的 workID，则更新该记录并移到尾部
  * @param {string} workID - 当前作品ID，例如 "WorkSaveNo17"
  * @param {string} episode - 当前播放章节，例如 "EP9"
  */
  recordLastWatched(workID, episode) {
    // 获取当前时间并格式化为 "yyyy年MM月dd日HH时mm分"
    const date = new Date();
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    const hour = ("0" + date.getHours()).slice(-2);
    const minute = ("0" + date.getMinutes()).slice(-2);
    const formattedTime = `${year}年${month}月${day}日${hour}时${minute}分`;

    const newRecord = {
      workID: workID,
      episode: episode,
      lastWatched: formattedTime
    };

    // 从内存中获取最近播放记录，如果不存在或不是数组，则初始化为空数组
    let records = [];
    if (this.data["LastWatched"]) {
      records = Array.isArray(this.data["LastWatched"]) ? this.data["LastWatched"] : [];
    }

    // 检查是否存在相同 workID 的记录，若存在则移除
    records = records.filter(record => record.workID !== workID);

    // 将新记录添加到尾部
    records.push(newRecord);

    // 如果记录数量超过30，则删除数组最前面（最早）的记录
    while (records.length > 30) {
      records.shift();
    }

    // 更新内存缓存
    this.data["LastWatched"] = records;

    // 使用 db.update 将整个记录数组保存在 _id 为 "LastWatched" 的文档中
    db.update(
      { _id: "LastWatched" },
      { $set: { data: records } },
      { upsert: true },
      err => {
        if (err) {
          console.error("记录最近播放出错：", err);
        } else {
          console.log("记录最近播放成功：", newRecord);
        }
      }
    );
  }

  /**
   * 获取最近播放数据
   * @returns {object} 最近播放记录对象
   */
  getRecentWatchedData() {
    const records = this.data["LastWatched"];
    return records;
  }

  /**
  * 根据数据中的 WorkSaveNo 查找记录，行为类似于 get，
  * 不同之处在于首键值不匹配 _id，而是匹配文档 data 内的 WorkSaveNo 字段
  * @param {string} keyPath - 点分路径，例如 "WorkSaveNo17.EPDetails.EP1.Condition"
  * @returns 找到的值或 false
  */
  find(keyPath) {
    if (!keyPath) {
      return this.data;
    }
    const segments = keyPath.split('.');
    const targetWorkSaveNo = segments[0];
    let foundRecord = null;
    // 遍历内存缓存中的所有记录，根据 data 内的 WorkSaveNo 匹配
    for (const key in this.data) {
      const record = this.data[key];
      if (record && record.WorkSaveNo === targetWorkSaveNo) {
        foundRecord = record;
        break;
      }
    }
    if (!foundRecord) {
      return false;
    }
    // 如果只查到顶层数据，则直接返回
    if (segments.length === 1) {
      return foundRecord;
    }
    // 否则继续使用 deepGet 查找后续嵌套路径
    const subPath = segments.slice(1).join('.');
    return deepGet(foundRecord, subPath, false);
  }

  /**
  * 根据 data 字段中的原始 WorkSaveNo 反查数据文档当前的 _id
  * @param {string} originalWorkSaveNo - 原始 WorkSaveNo，例如 "WorkSaveNo17"
  * @returns {Promise<string|false>} 找到的 _id 或 false
  */
  convertWorkSaveNo(originalWorkSaveNo) {
    return new Promise((resolve, reject) => {
      db.findOne({ "data.WorkSaveNo": originalWorkSaveNo }, (err, doc) => {
        if (err) {
          console.error("convertWorkSaveNo 查询出错:", err);
          return reject(err);
        }
        if (doc) {
          resolve(doc._id);
        } else {
          resolve(false);
        }
      });
    });
  }

  /**
   * 计算时间差并返回描述字符串
   * 
   * @param {string} timeStr 格式 "2025年02月10日20时17分"
   * @returns {string} 如 "2小时前", "十分钟前", "30秒前", "3天前", "1天5小时前", "50天前", "1年前", "1年150天前", "很久以前"
   */
  getTimeDifference(timeStr) {
    // 解析时间字符串
    const reg = /(\d{4})年(\d{1,2})月(\d{1,2})日(\d{1,2})时(\d{1,2})分/;
    const match = timeStr.match(reg);
    if (!match) return "";
    const [ , year, month, day, hour, minute ] = match;
    // 注意：JavaScript中月从0开始
    const pastTime = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));
    const now = new Date();
    let diffSec = Math.floor((now - pastTime) / 1000);
    
    // 如果时间在未来，则返回空字符串或可根据需求调整
    if (diffSec < 0) return "";
  
    const minuteSec = 60;
    const hourSec = 3600;
    const daySec = 86400;
    const yearSec = 365 * daySec;
  
    if (diffSec < minuteSec) {
        return diffSec + "秒前";
    } else if (diffSec < hourSec) {
        const minutes = Math.floor(diffSec / minuteSec);
        return minutes + "分钟前";
    } else if (diffSec < daySec) {
        const hours = Math.floor(diffSec / hourSec);
        return hours + "小时前";
    } else if (diffSec < yearSec) {
        const days = Math.floor(diffSec / daySec);
        if (days >= 10) {
            return days + "天前";
        }
        const hours = Math.floor((diffSec % daySec) / hourSec);
        return hours > 0 ? (days + "天" + hours + "小时前") : (days + "天前");
    } else {
        const years = Math.floor(diffSec / yearSec);
        if (years >= 3) {
            return "很久以前";
        }
        const remainingDays = Math.floor((diffSec % yearSec) / daySec);
        return remainingDays > 0 ? (years + "年" + remainingDays + "天前") : (years + "年前");
    }
  }
}

module.exports = ElectronStoreAdapter;