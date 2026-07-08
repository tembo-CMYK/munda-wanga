export interface Species {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  image: string;
  tag: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  location: string;
  time: string;
  avatar: string;
}
