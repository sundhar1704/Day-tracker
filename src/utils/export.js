import { Linking, Share } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as MailComposer from 'expo-mail-composer';

export async function makePdf(html) {
  const { uri } = await Print.printToFileAsync({ html });
  return uri;
}

// Opens the phone's share sheet with the PDF (Save to Drive/Files, WhatsApp, Gmail, ...)
export async function sharePdf(html, title = 'Share report') {
  const uri = await makePdf(html);
  if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing is not available on this device.');
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: title });
}

// Opens the mail app with the PDF already attached and the address filled in
export async function emailPdf({ html, to, subject, body }) {
  const uri = await makePdf(html);
  if (await MailComposer.isAvailableAsync()) {
    await MailComposer.composeAsync({ recipients: to ? [to] : [], subject, body, attachments: [uri] });
  } else if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: 'Send report by email' });
  } else throw new Error('No mail app is set up on this phone.');
}

// Opens WhatsApp with the text ready to send (you pick the contact)
export async function whatsappText(text) {
  const msg = text.length > 3500 ? text.slice(0, 3500) + '\n…' : text;
  try { await Linking.openURL('https://wa.me/?text=' + encodeURIComponent(msg)); }
  catch (e) { await Share.share({ message: msg }); }
}
