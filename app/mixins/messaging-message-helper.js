import Mixin from '@ember/object/mixin';

export default Mixin.create({
  convertServerMessagesToUI(messages, convId, options={}){
    let uiMessages = [];
    let lastDate = new Date(0);
    let sorted = messages.sort(function (a, b) {
      return a['date'] - b['date'];
    });
    let lastRecord = null;
    if (sorted.length > 0) {
      lastRecord = sorted[sorted.length-1];
    }

    const wrappedMessages = [];
    sorted.forEach(function (mes, index) {
      const displaySender = index < messages.length - 1 ? messages[index + 1].senderId !== mes.senderId : true;
      let senderSpace = index > 0 ? messages[index - 1].senderId !== mes.senderId : false;
      const mesDate = new Date(mes.date);
      let diff = lastDate.getTime() - mesDate.getTime();
      if (!options.skipDate){
        if (mesDate.getFullYear() !== lastDate.getFullYear() || mesDate.getDate() !== lastDate.getDate() || mesDate.getMonth() !== lastDate.getMonth())  {
          let dateContent = {isDate: true, message:{date: mesDate.setHours(0, 0, 0, 0)}, id: `${moment(mesDate).format('MM-DD-YYYY')}-${mes.convoId}`,convId: convId};
          wrappedMessages.push(dateContent);
          senderSpace=false;
        }
      }
      let mesCntent = {
        isMessage: true,
        message: mes,
        lastMessageIndex: lastMessageIndex,
        displaySender: displaySender,
        senderSpace: senderSpace,
        id: mes['id'],
        convId: convId
      };
      wrappedMessages.push(mesCntent);

      lastDate = mesDate

    });
    //group messages
    let lastMessageIndex = 0;
    const messagesBySender = [];
    wrappedMessages.forEach((mesCntent, index)=>{
      if (mesCntent.isMessage){
        if (mesCntent.message.type !== 'ShareVideo'){
          if (messagesBySender.length === 0){
            const lastGroup = {content:[mesCntent], senderId: mesCntent.message.senderId};
            messagesBySender.push(lastGroup);
          }else{
            const lastGroup = messagesBySender[messagesBySender.length-1];
            if (mesCntent.message.senderId === lastGroup.senderId){
              lastGroup.content.push(mesCntent);
            }else{
              const lastGroup = {content:[mesCntent], senderId: mesCntent.message.senderId};
              messagesBySender.push(lastGroup);
            }
          }
        }
      }
    });
    messagesBySender.forEach((group)=>{
      group.content.forEach((elem, index)=>{
        elem.message.maxIndex = group.content.length;
        elem.message.messageIndex = index;
      });
    });
    return {messages: wrappedMessages, lastRecord: lastRecord}
  }
});
