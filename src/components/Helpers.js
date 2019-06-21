export default class Helpers {
	static isNotEmpty = (str) => {
    if (str !== undefined && str !== null && str !== "") {
      return true;
    } else {
      return false;
    }
  }
}