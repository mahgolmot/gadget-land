const $=(selector,context=document)=>context.querySelector(selector);
const $$=(selector,context=document)=>Array.from(context.querySelectorAll(selector));
const fa=value=>new Intl.NumberFormat('fa-IR').format(Number(value)||0);
const safe=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
let cart=[];
try{const stored=JSON.parse(localStorage.getItem('gadgetland_cart_v1')||'[]');cart=Array.isArray(stored)?stored:[]}catch{}
let delivery=0,deliveryMethod='standard',deliveryPrices={standard:0,express:120000},discount=0,coupon='',currentStep=1,csrf='',currentUser=null;

function save(){localStorage.setItem('gadgetland_cart_v1',JSON.stringify(cart));localStorage.setItem('gadgetland_cart_count_v1',String(cart.reduce((sum,item)=>sum+Number(item.qty||0),0)))}
function toast(message){const node=$('.checkout-toast');node.textContent=message;node.classList.add('show');clearTimeout(node._timer);node._timer=setTimeout(()=>node.classList.remove('show'),2500)}
function subtotal(){return cart.reduce((sum,item)=>sum+(Number(item.price)||0)*(Number(item.qty)||0),0)}
function totals(){const productsTotal=subtotal();$('[data-subtotal]').textContent=fa(productsTotal)+' تومان';$('[data-delivery]').textContent=delivery?fa(delivery)+' تومان':'رایگان';$('[data-discount]').textContent=discount?'− '+fa(discount)+' تومان':'۰ تومان';$('[data-total]').textContent=fa(Math.max(0,productsTotal+delivery-discount))+' تومان'}

function render(){
  const items=$('.checkout-items'),summary=$('.summary-products'),empty=$('.empty-checkout'),next=$('[data-step="1"]>.primary');
  items.innerHTML=cart.map(item=>`<article class="checkout-item"><div class="checkout-thumb">${item.image_path?`<img src="${safe(item.image_path)}" alt="${safe(item.name)}">`:''}</div><div class="checkout-info"><h3>${safe(item.name)}</h3><p>${safe(item.colorLabel||'مدل اصلی')}${item.size?' · مدل '+safe(item.size):''}</p><div class="qty"><button type="button" data-minus="${safe(item.key)}" aria-label="کاهش تعداد">−</button><span>${fa(item.qty)}</span><button type="button" data-plus="${safe(item.key)}" aria-label="افزایش تعداد">+</button></div></div><div class="item-price"><b>${fa(Number(item.price)*Number(item.qty))} تومان</b><button type="button" class="remove-item" data-remove="${safe(item.key)}">حذف از سبد</button></div></article>`).join('');
  summary.innerHTML=cart.map(item=>`<div class="summary-product"><div><b>${safe(item.name)} × ${fa(item.qty)}</b><small>${safe(item.colorLabel||'مدل اصلی')}</small></div><span>${fa(Number(item.price)*Number(item.qty))} تومان</span></div>`).join('');
  $('[data-items-count]').textContent=fa(cart.reduce((sum,item)=>sum+Number(item.qty||0),0))+' محصول';
  empty.style.display=cart.length?'none':'block';items.style.display=cart.length?'grid':'none';next.style.display=cart.length?'flex':'none';
  $$('[data-plus]').forEach(button=>button.onclick=()=>change(button.dataset.plus,1));
  $$('[data-minus]').forEach(button=>button.onclick=()=>change(button.dataset.minus,-1));
  $$('[data-remove]').forEach(button=>button.onclick=()=>{cart=cart.filter(item=>item.key!==button.dataset.remove);save();render()});
  totals();
}

function change(key,amount){const item=cart.find(row=>row.key===key);if(!item)return;item.qty=Number(item.qty)+amount;if(item.qty<1)cart=cart.filter(row=>row!==item);save();render()}
function showStep(step){currentStep=step;$$('.step-panel').forEach(panel=>panel.classList.toggle('active',Number(panel.dataset.step)===step));$$('.steps span').forEach((node,index)=>{node.classList.toggle('active',index<step);node.classList.toggle('current',index===step-1)});window.scrollTo({top:0,behavior:'smooth'})}
function valid(){let ok=true;$('#shipping-form').querySelectorAll('[required]').forEach(input=>{let message=!input.value.trim()?'این فیلد الزامی است.':'';if(input.name==='phone'&&input.value&&!/^09\d{9}$/.test(input.value))message='شماره موبایل معتبر نیست.';if(input.name==='postal'&&input.value&&!/^\d{10}$/.test(input.value))message='کد پستی باید ۱۰ رقم باشد.';input.closest('.field').classList.toggle('invalid',Boolean(message));input.closest('.field').querySelector('small').textContent=message;if(message)ok=false});return ok}

$$('[data-next]').forEach(button=>button.onclick=()=>{if(currentStep===2&&!valid())return toast('اطلاعات ارسال را بررسی کن.');showStep(Number(button.dataset.next))});
$$('[data-prev]').forEach(button=>button.onclick=()=>showStep(Number(button.dataset.prev)));
$$('.delivery-card').forEach(card=>card.onclick=()=>{$$('.delivery-card').forEach(item=>item.classList.remove('active'));card.classList.add('active');card.querySelector('input').checked=true;deliveryMethod=card.querySelector('input').value;delivery=deliveryPrices[deliveryMethod]||0;totals()});
$('.coupon button').onclick=async()=>{const box=$('.coupon');coupon=$('.coupon input').value.trim().toUpperCase();box.classList.remove('error');if(!coupon){discount=0;box.querySelector('small').textContent='';totals();return}try{const response=await fetch('api/coupons/validate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:coupon,subtotal:subtotal()})}),data=await response.json();if(!response.ok||!data.ok)throw new Error(data.message||'کد تخفیف معتبر نیست.');discount=Number(data.discount)||0;box.querySelector('small').textContent='کد تخفیف با موفقیت اعمال شد.';totals()}catch(error){coupon='';discount=0;box.classList.add('error');box.querySelector('small').textContent=error.message;totals()}};

$('.place-order').onclick=async()=>{
  if(!$('#terms').checked)return toast('ابتدا قوانین خرید را تأیید کن.');
  if(!currentUser){toast('برای ثبت سفارش ابتدا وارد حساب شو.');setTimeout(()=>location.href='account.html',1200);return}
  const formData=new FormData($('#shipping-form')),button=$('.place-order');if(button.disabled)return;let redirecting=false;const buttonLabel=button.innerHTML;button.disabled=true;button.textContent='در حال اتصال به درگاه…';StoreLoading.show('در حال ثبت سفارش و انتقال به درگاه بانکی…');
  try{const response=await fetch('api/orders',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-CSRF-Token':csrf},body:JSON.stringify({items:cart.map(item=>({variant_id:item.variant_id,qty:item.qty})),coupon,delivery:deliveryMethod,shipping:{name:formData.get('name'),phone:formData.get('phone'),province:formData.get('province'),address:formData.get('address'),city:formData.get('city'),postal:formData.get('postal'),note:formData.get('note')}})}),data=await response.json();if(!response.ok||!data.ok)throw new Error(data.message||'ثبت سفارش ناموفق بود.');localStorage.setItem('gadgetland_pending_checkout_v1',JSON.stringify({order:data.order_number,cart:localStorage.getItem('gadgetland_cart_v1')}));redirecting=true;location.assign(data.redirect)}catch(error){toast(error.message)}finally{if(!redirecting){button.disabled=false;button.innerHTML=buttonLabel;StoreLoading.hide()}}
};

Promise.all([fetch('api/csrf',{credentials:'same-origin'}).then(response=>response.json()),fetch('api/settings/public',{credentials:'same-origin'}).then(response=>response.json())]).then(([session,publicData])=>{csrf=session.csrf;currentUser=session.user;if(currentUser){$('#shipping-form').elements.name.value=currentUser.name;$('#shipping-form').elements.phone.value=currentUser.phone}if(publicData.ok){deliveryPrices.standard=Number(publicData.settings.standard_shipping)||0;deliveryPrices.express=Number(publicData.settings.express_shipping)||0;$$('.delivery-card').forEach(card=>{const value=card.querySelector('input').value,amount=deliveryPrices[value];card.querySelector('strong').textContent=amount?fa(amount)+' تومان':'رایگان'});delivery=deliveryPrices[$('[name="delivery"]:checked').value]||0;totals()}}).catch(()=>toast('دریافت تنظیمات ارسال ناموفق بود.'));

render();
