// -------------Date Code----------------//
exports.getWeek = () => {
  // this line of code get the name of week
  const today = new Date();
  const option = {
    weekday: 'long'
  }
  let day = today.toLocaleDateString('en-US', option)
  return day;
}


exports.getDay =() => {
  // getting the full date of the today
  const today = new Date();
  let option = {
    weekday: "long",
    day: "numeric",
    month: "long"
  }
  let fullDate = today.toLocaleDateString('en-US', option)
  return fullDate;
}
