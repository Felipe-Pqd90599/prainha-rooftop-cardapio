/**
 * Mapeamento: JPEGs extraídos do PDF → item.id → assets/fotos/{id}.jpg
 * Fonte: scripts/extract-jpegs-from-pdf.js
 */
module.exports = {
  _hero: { src: 'embedded-01.jpg', dest: 'capa-prainha-rooftop.jpg' },
  mappings: [
    { src: 'embedded-02.jpg', itemId: 'ginga-tapioca', note: 'Peixe frito com tapioca' },
    { src: 'embedded-03.jpg', itemId: 'salada-camarao', note: 'Camarão grelhado com brócolis' },
    { src: 'embedded-04.jpg', itemId: 'camarao-prainha', note: 'Arroz cremoso com camarão empanado' },
    { src: 'embedded-05.jpg', itemId: 'linguica-prainha', note: 'Foto composta; prato principal = linguiça' },
    { src: 'embedded-06.jpg', itemId: 'caipifruta', note: 'Drink maracujá' },
    { src: 'embedded-07.jpg', itemId: 'files-camarao-queijo', note: 'Tapioca/recheio de camarão' },
    { src: 'embedded-08.jpg', itemId: 'carne-sol-coalho', note: 'Tapioca carne de sol e coalho' },
    // baiao-dois: imagem do PDF (embedded-09) era cuscuz — substituída por foto IA correta
    { src: 'embedded-10.jpg', itemId: 'parmegiana-carne', note: 'Parmegiana com espaguete' },
    { src: 'embedded-11.jpg', itemId: 'taca-camarao-empanado', note: 'Taça camarão empanado' },
    { src: 'embedded-12.jpg', itemId: 'mix-sertanejo', note: 'Carne, coalho e fritas' },
    { src: 'embedded-13.jpg', itemId: 'parmegiana-frango', note: 'Parmegiana bandeja' },
    { src: 'embedded-14.jpg', itemId: 'ensopado-peixe', note: 'Peixe ao molho com arroz' },
    { src: 'embedded-15.jpg', itemId: 'caipi-prainha', note: 'Drink autoral frutas' },
    { src: 'embedded-16.jpg', itemId: 'burger-potiguar', note: 'Burger com camarão' },
  ],
};
