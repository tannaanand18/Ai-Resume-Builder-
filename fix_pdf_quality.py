content = open('frontend/src/pages/ResumeBuilder.jsx', encoding='utf-8').read()

# Fix 1: Increase canvas scale from 2 to 3 for sharper PDF
content = content.replace(
    "scale: 2, useCORS: true, scrollY: 0, backgroundColor: '#ffffff'",
    "scale: 3, useCORS: true, scrollY: 0, backgroundColor: '#ffffff'"
)

# Fix 2: Use higher quality JPEG
content = content.replace(
    "canvas.toDataURL('image/jpeg', 1.0), 'JPEG'",
    "canvas.toDataURL('image/jpeg', 1.0), 'JPEG'"
)

open('frontend/src/pages/ResumeBuilder.jsx', 'w', encoding='utf-8').write(content)
print('Done!')