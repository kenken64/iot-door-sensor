class ArrayUtil {
  static removeItem(array, item) {
    let index = array.indexOf(item);
    if (index !== -1) array.splice(index, 1);
    return;
  }
}

module.exports = { ArrayUtil };