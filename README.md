# Notaflow

A sleek, modern note-taking application inspired by Apple Notes, built with Next.js 14 and React. Features end-to-end encryption, real-time saving, and a beautiful responsive design.

---

## Features

- 🔐 End-to-End Encryption: Secure note storage with client-side encryption
- 💫 Rich Text Editing: Custom-built editor with support for formatting
- 📱 Responsive Design: Optimized for desktop, tablet, and mobile devices
- 🎨 Theme System: Multiple color themes with dark/light mode support
- 🖼️ Image Support: Drag-and-drop image uploads with cloud storage
- 📌 Note Organization: Pin important notes and real-time search
- ⚡ Real-time Autosave: Changes are saved automatically as you type
- 👤 User Profiles: Customizable avatars and preferences

---

## Technology Stack

**Frontend**:
- Next.js 15 (React Framework)
- TypeScript for type safety
- Tailwind CSS for styling
- Framer Motion for animations

**Backend & Services**:
- Supabase for authentication and database
- PostgreSQL for data storage
- Supabase Storage for image uploads

**State Management**:
- React Context API
- Custom hooks for state logic

**Security**:
- Client-side encryption
- Master password protection
- Secure authentication flow

---

## Performance Features

- Dynamic imports for code splitting
- Optimized image loading
- Responsive image handling
- Debounced auto-saving
- Smooth animations
- Mobile-first approach

---

## 📱 Mobile Optimizations

- Touch-friendly interface
- Bottom navigation bar
- Floating action buttons
- Optimized input handling
- Gesture support
- Responsive image uploads

---

## Getting Started

1. Clone the repository:

```
git clone https://github.com/your-username/notaflow.git
```

2. Install dependencies:

```
npm install
```

3. Set up your environment variables (refer to `.env.example`).

4. Run the development server:

```
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Recent Improvements

- **Enhanced Theme System**: Added a robust theme context with persistent preferences
- **Mobile-Optimized Interface**: Completely redesigned the mobile experience
- **Apple-like Design**: Refined styling to closely match Apple's aesthetic
- **Custom Editor**: Replaced ReactQuill with a native contentEditable editor
- **Responsive Layouts**: Improved adaptability for different screen sizes
- **Image Uploader**: Added a drag-and-drop image upload interface
- **Performance Optimizations**: Improved loading and transition animations
- **Accessibility Improvements**: Better focus states and keyboard navigation
- **Dark Mode Enhancements**: Refined dark mode experience with proper contrast

---

## Client-Side Encryption Process

### 🔑 Encryption Components

**Master Password System**:

```typescript
const deriveKeyFromPassword = async (password: string, salt?: string) => {
    const useSalt = salt || crypto.randomUUID();
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    
    const baseKey = await window.crypto.subtle.importKey(
        'raw',
        passwordData,
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );

    const key = await window.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: encoder.encode(useSalt),
            iterations: 100000,
            hash: 'SHA-256'
        },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );

    return { key, salt: useSalt };
};
```

---

**Encryption Key Generation**:

```typescript
const generateEncryptionKey = () => {
    const array = new Uint8Array(32); // 256 bits
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};
```

---

**Encrypt Text**:

```typescript
const encryptText = (text: string): string => {
    if (!text) return text;
    try {
        const key = 'SIMPLE_KEY';
        let result = '';
        for(let i = 0; i < text.length; i++) {
            result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return btoa(result);
    } catch (error) {
        console.error('Encryption error:', error);
        return text;
    }
};
```

---

**Decrypt Text**:

```typescript
const decryptText = (encryptedText: string): string => {
    if (!encryptedText) return encryptedText;
    try {
        if (!/^[a-zA-Z0-9+/=]+$/.test(encryptedText)) {
            return encryptedText;
        }
        const decoded = atob(encryptedText);
        const key = 'SIMPLE_KEY';
        let result = '';
        for(let i = 0; i < decoded.length; i++) {
            result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return result;
    } catch (error) {
        console.error('Decryption error:', error);
        return encryptedText;
    }
};
```

---

### 🔐 Security Features

- **Client-Side Only**:  
  All encryption and decryption happens in the browser.  
  The server never sees unencrypted data.  
  Uses Web Crypto API for secure operations.

- **Password Protection**:  
  PBKDF2 with 100,000 iterations for password hashing.  
  Salted hashes for additional security.  
  Secure key derivation process.

---

### Data Flow

```
User Input → Encryption → Base64 Encoding → Database
Database → Base64 Decoding → Decryption → User Display
```

---

### ⚠️ Important Note

The current implementation using XOR cipher is simplified for demonstration.

For production use:
- Use AES-GCM encryption instead of XOR
- Implement proper key management
- Add proper IV (Initialization Vector) handling
- Use secure random number generation for all cryptographic operations

---

## License

MIT

---

## Credits

Created with ❤️ by taahabz

