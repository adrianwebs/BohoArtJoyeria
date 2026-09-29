import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { HelpCircle, Mail, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes & Envíos | Bohoart Jewelry',
  description: 'Resuelve todas tus dudas sobre tiempos de entrega, cuidados de la arcilla polimérica, devoluciones y pedidos personalizados en Bohoart.',
};

const FAQS = [
  {
    q: '¿Los pendientes pesan en la oreja?',
    a: '¡Para nada! La arcilla polimérica cocida es un material sumamente ligero. Un par de pendientes medianos o grandes pesa entre 3 y 5 gramos en total (menos que una moneda pequeña). Podrás llevarlos puestos todo el día sin notar ningún tirón ni molestia.',
  },
  {
    q: '¿Son hipoalergénicos? ¿Me darán alergia?',
    a: 'Todas nuestras fornituras, pernos, arandelas y aros están fabricados en acero inoxidable quirúrgico 316L o plata de ley 925, libres de níquel y plomo. Son completamente aptos para pieles sensibles y orejas delicadas.',
  },
  {
    q: '¿Cuánto tardan los envíos?',
    a: 'Los pedidos en stock se preparan en 24 horas laborables en nuestro taller y se envían por mensajería urgente 24/48h con número de seguimiento para Península y Baleares.',
  },
  {
    q: '¿Cómo son los gastos de envío?',
    a: 'El coste de envío estándar es de 3,95€ para España peninsular. En todas las compras superiores a 40,00€, el envío es 100% GRATUITO.',
  },
  {
    q: '¿Cómo debo cuidar mis joyas de arcilla polimérica?',
    a: 'La arcilla es resistente y flexible, pero se recomienda no forzarla ni doblarla. Para limpiarla del polvo o maquillaje, pasa suavemente un paño húmedo con agua o una toallita sin alcohol. Evita rociar perfume o colonia directamente sobre la joya.',
  },
  {
    q: '¿Puedo solicitar un diseño o color personalizado para un evento o boda?',
    a: '¡Por supuesto! Nos encanta crear piezas a medida para novias, damas de honor o looks de invitada. Escríbenos a hola@bohoartjoyeria.com o por mensaje directo en nuestro Instagram @bohoart.jewelry.',
  },
];

export default function FAQPage() {
  return (
    <div className="bg-boho-linen min-h-screen py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center max-w-xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-boho-sand-200 text-boho-terracotta text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Centro de Ayuda</span>
          </div>
          <h1 className="font-serif-boho text-3xl sm:text-4xl font-bold text-boho-charcoal">
            Preguntas Frecuentes
          </h1>
          <p className="text-xs sm:text-sm text-boho-charcoal-muted">
            Todo lo que necesitas saber antes y después de comprar en Bohoart Jewelry.
          </p>
        </div>

        {/* FAQs List */}
        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl border border-boho-sand-200 shadow-soft space-y-2"
            >
              <h3 className="font-serif-boho text-base font-bold text-boho-charcoal">
                {faq.q}
              </h3>
              <p className="text-xs sm:text-sm text-boho-charcoal-muted leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>

        {/* Support Banner */}
        <div className="bg-boho-sand-100 p-8 rounded-3xl border border-boho-sand-300 text-center space-y-3">
          <h3 className="font-serif-boho text-lg font-bold text-boho-charcoal">
            ¿Tienes alguna otra duda?
          </h3>
          <p className="text-xs text-boho-charcoal-muted max-w-md mx-auto">
            Estamos al otro lado para ayudarte con tu pedido, tallas o recomendaciones de estilo.
          </p>
          <div className="pt-2">
            <Link
              href="/contacto"
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-boho-terracotta text-white rounded-full text-xs font-semibold hover:bg-boho-terracotta-600 transition-colors shadow-sm"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Contactar con el Taller</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
