const SERVICES = {
    twarz: [
        { name: 'Oczyszczanie wodorowe HydraFacial', desc: 'Głębokie oczyszczanie i nawilżenie skóry technologią wodorową.', price: 180, duration: 60, image: 'images/service-hydrafacial.jpg' },
        { name: 'Mezoterapia igłowa', desc: 'Odmładzanie skóry mikroigłami z koktajlem witaminowym.', price: 350, duration: 45, image: 'images/service-mezoterapia.jpg' },
        { name: 'Peeling chemiczny', desc: 'Kontrolowana eksfoliacja kwasami dla gładkiej, promiennej skóry.', price: 220, duration: 40, image: 'images/service-peeling.jpg' },
        { name: 'Mikrodermabrazja diamentowa', desc: 'Mechaniczny peeling diamentowymi końcówkami.', price: 200, duration: 50, image: 'images/service-mikrodermabrazja.jpg' },
        { name: 'Masaż kobido', desc: 'Japoński lifting twarzy bez skalpela — modelowanie i odmłodzenie.', price: 250, duration: 60, image: 'images/service-kobido.jpg' },
    ],
    cialo: [
        { name: 'Masaż gorącymi kamieniami', desc: 'Relaksujący masaż bazaltowymi kamieniami wulkanicznymi.', price: 280, duration: 75, image: 'images/service-kamienie.jpg' },
        { name: 'Peeling ciała cukrowy', desc: 'Złuszczanie i nawilżenie skóry naturalnym peelingiem cukrowym.', price: 160, duration: 50, image: 'images/service-peeling-ciala.jpg' },
        { name: 'Ujędrnianie ciała RF', desc: 'Radiofrekwencja modelująca sylwetkę i ujędrniająca skórę.', price: 300, duration: 60, image: 'images/service-rf.jpg' },
    ],
    dlonie: [
        { name: 'Manicure hybrydowy', desc: 'Trwały lakier hybrydowy z pielęgnacją dłoni.', price: 120, duration: 60, image: 'images/service-manicure.jpg' },
        { name: 'Pedicure spa', desc: 'Kompleksowa pielęgnacja stóp z masażem i peelingiem.', price: 140, duration: 70, image: 'images/service-pedicure.jpg' },
    ],
    brwi: [
        { name: 'Lifting rzęs + laminacja', desc: 'Naturalne podkręcenie i odżywienie rzęs.', price: 160, duration: 75, image: 'images/service-lifting.jpg' },
        { name: 'Modelowanie brwi henną', desc: 'Regulacja i koloryzacja brwi henną dla idealnego kształtu.', price: 80, duration: 30, image: 'images/service-brwi.jpg' },
        { name: 'Przedłużanie rzęs 1:1', desc: 'Klasyczne przedłużanie metodą 1:1 — naturalny efekt.', price: 200, duration: 120, image: 'images/service-rzesy.jpg' },
    ],
    depilacja: [
        { name: 'Depilacja laserowa', desc: 'Trwałe usuwanie owłosienia laserem diodowym.', price: 150, duration: null, pricePrefix: 'od', image: 'images/service-laser.jpg' },
        { name: 'Depilacja woskiem (nogi)', desc: 'Klasyczna depilacja ciepłym woskiem — gładkość na tygodnie.', price: 120, duration: 45, image: 'images/service-wosk.jpg' },
        { name: 'Depilacja pastą cukrową (bikini)', desc: 'Delikatna depilacja naturalną pastą cukrową.', price: 100, duration: 30, image: 'images/service-cukrowa.jpg' },
    ]
};

const REVIEWS = [
    { name: 'Agnieszka K.', rating: 5.0, text: 'Najlepszy salon w okolicy! Pani Anna jest niesamowita — po zabiegu HydraFacial moja skóra wygląda jak nigdy wcześniej.', avatar: 'images/avatars/avatar-1.jpg' },
    { name: 'Marta W.', rating: 5.0, text: 'Chodzę tu na manicure hybrydowy od pół roku. Zawsze idealnie, a lakier trzyma się minimum 3 tygodnie.', avatar: 'images/avatars/avatar-2.jpg' },
    { name: 'Katarzyna L.', rating: 4.9, text: 'Masaż gorącymi kamieniami to czyste niebo. Wychodzę kompletnie zrelaksowana za każdym razem.', avatar: 'images/avatars/avatar-3.jpg' },
    { name: 'Joanna P.', rating: 5.0, text: 'Lifting rzęs zmienił moje poranne rutyny — zero tuszu, a oczy wyglądają pięknie. Gorąco polecam!', avatar: 'images/avatars/avatar-4.jpg' },
    { name: 'Aleksandra M.', rating: 4.8, text: 'Korzystałam z Pakietu Panna Młoda przed ślubem. Czułam się jak gwiazda — wszystko dopięte na ostatni guzik.', avatar: 'images/avatars/avatar-5.jpg' },
    { name: 'Natalia S.', rating: 5.0, text: 'Peeling chemiczny dał niesamowite efekty po zaledwie dwóch wizytach. Cera gładka i promienna!', avatar: 'images/avatars/avatar-6.jpg' },
];

const PACKAGES = [
    { name: 'Pakiet Panna Młoda', price: 850, badge: 'Bestseller', desc: 'makijaż + paznokcie + rzęsy + masaż', items: ['Makijaż ślubny', 'Manicure hybrydowy', 'Przedłużanie rzęs', 'Masaż relaksacyjny'] },
    { name: 'Dzień Spa dla Dwojga', price: 600, badge: 'Nowość', desc: '2× masaż + 2× peeling + herbata', items: ['2× Masaż gorącymi kamieniami', '2× Peeling ciała cukrowy', 'Herbata i przekąski'] },
    { name: 'Rytuał Anti-Age', price: 480, badge: 'Promocja', desc: 'mezoterapia + peeling + maska + serum', items: ['Mezoterapia igłowa', 'Peeling chemiczny', 'Maska kolagenowa', 'Serum z witaminą C'] },
];

const GALLERY = [
    { src: 'images/gallery-1.jpg', alt: 'Wnętrze salonu Atelier Piękna', caption: 'Nasz salon' },
    { src: 'images/gallery-2.jpg', alt: 'Zabieg HydraFacial w trakcie', caption: 'HydraFacial' },
    { src: 'images/gallery-3.jpg', alt: 'Manicure hybrydowy', caption: 'Manicure' },
    { src: 'images/gallery-4.jpg', alt: 'Masaż gorącymi kamieniami', caption: 'Masaż' },
    { src: 'images/gallery-5.jpg', alt: 'Strefa relaksu', caption: 'Strefa relaksu' },
    { src: 'images/gallery-6.jpg', alt: 'Kosmetyki profesjonalne', caption: 'Nasze kosmetyki' },
    { src: 'images/gallery-7.jpg', alt: 'Lifting rzęs efekt', caption: 'Efekt liftingu' },
    { src: 'images/gallery-8.jpg', alt: 'Pedicure spa zabieg', caption: 'Pedicure spa' },
    { src: 'images/gallery-9.jpg', alt: 'Świece i detale wnętrza', caption: 'Detale' },
    { src: 'images/gallery-10.jpg', alt: 'Zadowolona klientka po zabiegu', caption: 'Efekt zabiegu' },
];

const TAB_KEYS = ['twarz', 'cialo', 'dlonie', 'brwi', 'depilacja'];
const TAB_LABELS = { twarz: 'Twarz', cialo: 'Ciało', dlonie: 'Dłonie & Stopy', brwi: 'Brwi & Rzęsy', depilacja: 'Depilacja' };
